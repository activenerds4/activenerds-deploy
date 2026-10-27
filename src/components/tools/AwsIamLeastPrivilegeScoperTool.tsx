import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, RotateCcw, Plus, Trash2, ShieldAlert, ShieldCheck } from "lucide-react";

export interface IamStatement {
  id: string;
  effect: "Allow" | "Deny";
  actions: string;
  resources: string;
}

export interface IamInput {
  statements: IamStatement[];
}

const DEFAULTS: IamInput = {
  statements: [
    {
      id: "s1",
      effect: "Allow",
      actions: "s3:GetObject, s3:ListBucket",
      resources: "arn:aws:s3:::my-data-bucket/*",
    },
    {
      id: "s2",
      effect: "Allow",
      actions: "s3:*",
      resources: "*",
    },
  ],
};

/* Known risky wildcard patterns */
const RISKY_ACTION_PATTERNS: { pattern: string; reason: string; severity: "high" | "medium" }[] = [
  {
    pattern: "*",
    reason: "Action: * grants every API call in the service — maximum blast radius.",
    severity: "high",
  },
  {
    pattern: "iam:*",
    reason: "iam:* can create new admin users, escalate privileges, or delete MFA.",
    severity: "high",
  },
  {
    pattern: "sts:AssumeRole*",
    reason: "sts:AssumeRole* allows assuming any role the account trusts.",
    severity: "high",
  },
  {
    pattern: "ec2:*",
    reason: "ec2:* can terminate instances, modify security groups, and read userdata secrets.",
    severity: "medium",
  },
  {
    pattern: "s3:*",
    reason: "s3:* includes DeleteBucket — can wipe an entire bucket.",
    severity: "medium",
  },
  {
    pattern: "kms:*",
    reason: "kms:* can schedule key deletion, defeating encryption-at-rest.",
    severity: "high",
  },
  {
    pattern: "secretsmanager:*",
    reason: "secretsmanager:* reads every secret the account holds.",
    severity: "high",
  },
  {
    pattern: "lambda:*",
    reason: "lambda:* can invoke any function and read environment variables (often secrets).",
    severity: "medium",
  },
  {
    pattern: "logs:*",
    reason: "logs:* can delete CloudWatch log groups, destroying audit trails.",
    severity: "medium",
  },
  {
    pattern: "dynamodb:*",
    reason: "dynamodb:* includes DeleteTable — irreversible data loss.",
    severity: "medium",
  },
];

export interface Finding {
  statementId: string;
  severity: "high" | "medium";
  message: string;
  suggestion: string;
}

export function analyzePolicy(input: IamInput): { findings: Finding[]; scopedYaml: string } {
  const findings: Finding[] = [];

  for (const stmt of input.statements) {
    const actions = stmt.actions
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    const resources = stmt.resources
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    for (const action of actions) {
      const match = RISKY_ACTION_PATTERNS.find(
        (r) => action.toLowerCase() === r.pattern.toLowerCase(),
      );
      if (match) {
        findings.push({
          statementId: stmt.id,
          severity: match.severity,
          message: `Action "${action}" is over-privileged: ${match.reason}`,
          suggestion:
            action === "*"
              ? "List only the specific actions needed (e.g. s3:GetObject, s3:PutObject)."
              : `Replace with the specific ${action.split(":")[0]} operations you actually call.`,
        });
      }
    }

    if (resources.includes("*")) {
      findings.push({
        statementId: stmt.id,
        severity: "high",
        message: `Resource: "*" in statement "${stmt.id}" applies to every resource in the account.`,
        suggestion: "Scope to a specific ARN (arn:aws:s3:::bucket-name/*) or ARN pattern.",
      });
    }

    if (stmt.effect === "Allow" && actions.includes("*") && resources.includes("*")) {
      findings.push({
        statementId: stmt.id,
        severity: "high",
        message: `Statement "${stmt.id}" is effectively AdministratorAccess (Action: * + Resource: *).`,
        suggestion:
          "This is the most dangerous pattern in IAM. Split into least-privilege statements.",
      });
    }
  }

  // Build a scoped, cleaned YAML
  const yaml = buildScopedYaml(input, findings);
  return { findings, scopedYaml: yaml };
}

function buildScopedYaml(input: IamInput, findings: Finding[]): string {
  const lines: string[] = [
    "# Least-privilege scoped policy (generated)",
    'Version: "2012-10-17"',
    "Statement:",
  ];

  input.statements.forEach((stmt, idx) => {
    const actions = stmt.actions
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    const resources = stmt.resources
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    // Auto-narrow wildcards where we have a safe suggestion
    const cleanedActions = actions.map((a) => {
      if (a === "*") return "s3:GetObject"; // placeholder narrowing
      return a;
    });
    const cleanedResources = resources.map((r) =>
      r === "*" ? "arn:aws:s3:::REPLACE-WITH-BUCKET/*" : r,
    );

    lines.push(`- Sid: Stmt${idx + 1}`);
    lines.push(`  Effect: ${stmt.effect}`);
    if (cleanedActions.length === 1) {
      lines.push(`  Action: "${cleanedActions[0]}"`);
    } else {
      lines.push(`  Action:`);
      cleanedActions.forEach((a) => lines.push(`  - "${a}"`));
    }
    if (cleanedResources.length === 1) {
      lines.push(`  Resource: "${cleanedResources[0]}"`);
    } else {
      lines.push(`  Resource:`);
      cleanedResources.forEach((r) => lines.push(`  - "${r}"`));
    }
  });

  if (findings.length === 0) {
    lines.unshift("# No over-privilege findings — policy looks least-privilege.");
  }
  return lines.join("\n");
}

let counter = 0;
const uid = () => `s${Date.now()}_${counter++}`;

export function AwsIamLeastPrivilegeScoperTool() {
  const [input, setInput] = useState<IamInput>(DEFAULTS);
  const { findings, scopedYaml } = useMemo(() => analyzePolicy(input), [input]);

  const update = (id: string, patch: Partial<IamStatement>) =>
    setInput((prev) => ({
      ...prev,
      statements: prev.statements.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));

  const addStmt = () =>
    setInput((prev) => ({
      ...prev,
      statements: [...prev.statements, { id: uid(), effect: "Allow", actions: "", resources: "" }],
    }));

  const removeStmt = (id: string) =>
    setInput((prev) => ({ ...prev, statements: prev.statements.filter((s) => s.id !== id) }));

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(scopedYaml);
  }, [scopedYaml]);

  const reset = () => setInput(DEFAULTS);

  const highCount = findings.filter((f) => f.severity === "high").length;
  const medCount = findings.filter((f) => f.severity === "medium").length;

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">IAM Policy Statements</h2>
          <p className="text-sm text-muted-foreground">
            Add each statement; wildcards are flagged automatically.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={addStmt}>
          <Plus className="mr-2 h-4 w-4" /> Add statement
        </Button>
      </div>

      <div className="space-y-4">
        {input.statements.map((stmt) => (
          <div key={stmt.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <select
                className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                value={stmt.effect}
                onChange={(e) =>
                  update(stmt.id, { effect: e.target.value as IamStatement["effect"] })
                }
              >
                <option value="Allow">Allow</option>
                <option value="Deny">Deny</option>
              </select>
              <Button variant="ghost" size="sm" onClick={() => removeStmt(stmt.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div>
              <Label htmlFor={`act-${stmt.id}`}>Actions (comma-separated)</Label>
              <input
                id={`act-${stmt.id}`}
                value={stmt.actions}
                onChange={(e) => update(stmt.id, { actions: e.target.value })}
                placeholder="s3:GetObject, s3:PutObject"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor={`res-${stmt.id}`}>Resources (comma-separated ARNs)</Label>
              <input
                id={`res-${stmt.id}`}
                value={stmt.resources}
                onChange={(e) => update(stmt.id, { resources: e.target.value })}
                placeholder="arn:aws:s3:::my-bucket/*"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Findings */}
      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
        <div className="flex items-center gap-3">
          {highCount === 0 ? (
            <ShieldCheck className="h-5 w-5 text-accent" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-destructive" />
          )}
          <span className="text-sm font-semibold text-foreground">
            {findings.length === 0
              ? "No over-privilege findings — policy looks least-privilege."
              : `${findings.length} finding${findings.length === 1 ? "" : "s"} (${highCount} high, ${medCount} medium)`}
          </span>
        </div>
        {findings.length > 0 && (
          <ul className="space-y-2">
            {findings.map((f, i) => (
              <li
                key={i}
                className={`rounded-md border-l-2 p-2 text-sm ${
                  f.severity === "high"
                    ? "border-destructive bg-destructive/5"
                    : "border-yellow-500 bg-yellow-500/5"
                }`}
              >
                <p className="font-medium text-foreground">{f.message}</p>
                <p className="mt-0.5 text-muted-foreground">→ {f.suggestion}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Scoped YAML */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Scoped policy (copy-ready)</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" /> Copy YAML
            </Button>
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </div>
        <pre className="max-h-72 overflow-auto rounded-md border border-border bg-background p-3 font-mono text-xs text-foreground">
          {scopedYaml}
        </pre>
      </div>
    </Card>
  );
}

export default AwsIamLeastPrivilegeScoperTool;
