import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RotateCcw } from "lucide-react";

export interface OidcInput {
  cloud: "aws" | "gcp";
  githubOrg: string;
  githubRepo: string;
  branch: string;
  environment: string;
  awsRoleName: string;
  awsAccountId: string;
  sessionDuration: number;
  gcpPoolId: string;
  gcpProviderId: string;
  gcpServiceAccountEmail: string;
}

const DEFAULTS: OidcInput = {
  cloud: "aws",
  githubOrg: "activenerds",
  githubRepo: "platform-infra",
  branch: "main",
  environment: "production",
  awsRoleName: "github-actions-deploy",
  awsAccountId: "123456789012",
  sessionDuration: 3600,
  gcpPoolId: "github-pool",
  gcpProviderId: "github-provider",
  gcpServiceAccountEmail: "deploy@activenerds-prod.iam.gserviceaccount.com",
};

function awsSubject(input: OidcInput): string {
  // repo + ref + environment scoping
  return `repo:${input.githubOrg}/${input.githubRepo}:ref:refs/heads/${input.branch}:environment:${input.environment}`;
}

export function generateAwsTrustPolicy(input: OidcInput): string {
  const providerArn = `arn:aws:iam::${input.awsAccountId}:oidc-provider/token.actions.githubusercontent.com`;
  const subject = awsSubject(input);
  return JSON.stringify(
    {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: {
            Federated: providerArn,
          },
          Action: "sts:AssumeRoleWithWebIdentity",
          Condition: {
            StringEquals: {
              "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
            },
            StringLike: {
              "token.actions.githubusercontent.com:sub": subject,
            },
          },
        },
      ],
    },
    null,
    2,
  );
}

export function generateAwsRoleCli(input: OidcInput): string {
  const trust = generateAwsTrustPolicy(input);
  const NL = String.fromCharCode(10);
  const oneLine = trust.split(NL).join(" ").replace(/"/g, "'");
  return [
    "# 1. Create the OIDC provider (one-time per account)",
    "aws iam create-open-id-connect-provider \\\n  --url https://token.actions.githubusercontent.com \\\n  --client-id-list sts.amazonaws.com \\\n  --thumbprint-list 6938fd4cd98dda4cbb68f763d25b8174974a1b6f",
    "",
    "# 2. Create the role with the trust policy",
    `aws iam create-role \\\n  --role-name ${input.awsRoleName} \\\n  --assume-role-policy-document '${oneLine}'`,
    "",
    "# 3. Attach a least-privilege inline/managed policy",
    `aws iam put-role-policy \\\n  --role-name ${input.awsRoleName} \\\n  --policy-name deploy-policy \\\n  --policy-document file://policy.json`,
  ].join("\n");
}

export function generateGcpWorkloadIdentity(input: OidcInput): string {
  const pool = `projects/-/locations/global/workloadIdentityPools/${input.gcpPoolId}`;
  const provider = `${pool}/providers/${input.gcpProviderId}`;
  const attributeMapping = {
    "google.subject": "assertion.sub",
    "attribute.repository": "assertion.repository",
    "attribute.ref": "assertion.ref",
    "attribute.environment": "assertion.environment",
  };
  return JSON.stringify(
    {
      workloadIdentityPool: input.gcpPoolId,
      provider: input.gcpProviderId,
      issuerUri: "https://token.actions.githubusercontent.com",
      attributeMapping,
      // Restrict to this repo + branch + environment
      attributeCondition: `assertion.repository=='${input.githubOrg}/${input.githubRepo}' && assertion.ref=='refs/heads/${input.branch}' && assertion.environment=='${input.environment}'`,
      serviceAccountEmail: input.gcpServiceAccountEmail,
    },
    null,
    2,
  );
}

export function generateGcpGithubActions(input: OidcInput): string {
  const providerPath = `projects/123456/locations/global/workloadIdentityPools/${input.gcpPoolId}/providers/${input.gcpProviderId}`;
  return [
    `# .github/workflows/deploy.yml`,
    `permissions:`,
    `  id-token: write   # required for OIDC`,
    `  contents: read`,
    ``,
    `jobs:`,
    `  deploy:`,
    `    runs-on: ubuntu-latest`,
    `    environment: ${input.environment}`,
    `    steps:`,
    `      - uses: actions/checkout@v4`,
    `      - id: auth`,
    `        uses: google-github-actions/auth@v2`,
    `        with:`,
    `          workload_identity_provider: "${providerPath}"`,
    `          service_account: "${input.gcpServiceAccountEmail}"`,
    `      - uses: google-github-actions/setup-gcloud@v2`,
  ].join("\n");
}

export function GithubActionsOidcTrustGeneratorTool() {
  const [input, setInput] = useState<OidcInput>(DEFAULTS);

  const awsTrust = useMemo(() => generateAwsTrustPolicy(input), [input]);
  const awsCli = useMemo(() => generateAwsRoleCli(input), [input]);
  const gcpPool = useMemo(() => generateGcpWorkloadIdentity(input), [input]);
  const gcpWorkflow = useMemo(() => generateGcpGithubActions(input), [input]);

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const reset = () => setInput(DEFAULTS);

  return (
    <Card className="p-6 space-y-6">
      <div className="flex gap-2">
        {(["aws", "gcp"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setInput({ ...input, cloud: c })}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              input.cloud === c
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {c === "aws" ? "AWS IAM Role" : "GCP Workload Identity"}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="org">GitHub org</Label>
          <Input
            id="org"
            value={input.githubOrg}
            onChange={(e) => setInput({ ...input, githubOrg: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="repo">Repository</Label>
          <Input
            id="repo"
            value={input.githubRepo}
            onChange={(e) => setInput({ ...input, githubRepo: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="branch">Branch / ref</Label>
          <Input
            id="branch"
            value={input.branch}
            onChange={(e) => setInput({ ...input, branch: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="env">GitHub environment</Label>
          <Input
            id="env"
            value={input.environment}
            onChange={(e) => setInput({ ...input, environment: e.target.value })}
          />
        </div>
      </div>

      {input.cloud === "aws" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="acct">AWS account ID</Label>
              <Input
                id="acct"
                value={input.awsAccountId}
                onChange={(e) => setInput({ ...input, awsAccountId: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="role">Role name</Label>
              <Input
                id="role"
                value={input.awsRoleName}
                onChange={(e) => setInput({ ...input, awsRoleName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="dur">Session duration (s)</Label>
              <Input
                id="dur"
                type="number"
                value={input.sessionDuration}
                onChange={(e) =>
                  setInput({ ...input, sessionDuration: parseInt(e.target.value) || 3600 })
                }
              />
            </div>
          </div>

          <OutputBlock
            title="IAM Role Trust Policy (JSON)"
            text={awsTrust}
            onCopy={() => copy(awsTrust)}
          />
          <OutputBlock title="AWS CLI setup commands" text={awsCli} onCopy={() => copy(awsCli)} />

          <div className="rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">GitHub Actions usage</p>
            <pre className="mt-2 overflow-auto font-mono text-xs">{`permissions:
  id-token: write
  contents: read
jobs:
  deploy:
    environment: ${input.environment}
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::${input.awsAccountId}:role/${input.awsRoleName}
          aws-region: us-east-1`}</pre>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pool">Pool ID</Label>
              <Input
                id="pool"
                value={input.gcpPoolId}
                onChange={(e) => setInput({ ...input, gcpPoolId: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="prov">Provider ID</Label>
              <Input
                id="prov"
                value={input.gcpProviderId}
                onChange={(e) => setInput({ ...input, gcpProviderId: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="sa">Service account email</Label>
              <Input
                id="sa"
                value={input.gcpServiceAccountEmail}
                onChange={(e) => setInput({ ...input, gcpServiceAccountEmail: e.target.value })}
              />
            </div>
          </div>

          <OutputBlock
            title="GCP Workload Identity Pool Provider (JSON)"
            text={gcpPool}
            onCopy={() => copy(gcpPool)}
          />
          <OutputBlock
            title="GitHub Actions workflow snippet"
            text={gcpWorkflow}
            onCopy={() => copy(gcpWorkflow)}
          />
        </>
      )}

      <Button variant="outline" size="sm" onClick={reset}>
        <RotateCcw className="mr-2 h-4 w-4" /> Reset
      </Button>
    </Card>
  );
}

function OutputBlock({ title, text, onCopy }: { title: string; text: string; onCopy: () => void }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <Button variant="outline" size="sm" onClick={onCopy}>
          <Copy className="mr-2 h-4 w-4" /> Copy
        </Button>
      </div>
      <pre className="max-h-64 overflow-auto rounded-md border border-border bg-background p-3 font-mono text-xs text-foreground">
        {text}
      </pre>
    </div>
  );
}

export default GithubActionsOidcTrustGeneratorTool;
