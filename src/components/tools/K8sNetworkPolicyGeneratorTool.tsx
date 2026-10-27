import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RotateCcw, Plus, Trash2 } from "lucide-react";

export interface Rule {
  id: string;
  direction: "ingress" | "egress";
  peerType: "namespace" | "podSelector" | "cidr" | "all";
  peerValue: string;
  port: string;
  protocol: string;
}

export interface PolicyInput {
  name: string;
  namespace: string;
  podSelector: string;
  defaultDenyIngress: boolean;
  defaultDenyEgress: boolean;
  rules: Rule[];
}

const DEFAULTS: PolicyInput = {
  name: "web-app-policy",
  namespace: "default",
  podSelector: "app: web",
  defaultDenyIngress: true,
  defaultDenyEgress: true,
  rules: [
    {
      id: "r1",
      direction: "ingress",
      peerType: "namespace",
      peerValue: "ingress-nginx",
      port: "8080",
      protocol: "TCP",
    },
    {
      id: "r2",
      direction: "egress",
      peerType: "cidr",
      peerValue: "10.0.0.0/8",
      port: "5432",
      protocol: "TCP",
    },
  ],
};

function indent(n: number) {
  return "  ".repeat(n);
}

export function generatePolicyYaml(input: PolicyInput): string {
  const lines: string[] = [
    "apiVersion: networking.k8s.io/v1",
    "kind: NetworkPolicy",
    "metadata:",
    `  name: ${input.name}`,
    `  namespace: ${input.namespace}`,
    "spec:",
    "  podSelector:",
  ];

  // podSelector matchLabels
  const labels = input.podSelector
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (labels.length === 0) {
    lines.push("    matchLabels: {}");
  } else {
    lines.push("    matchLabels:");
    for (const l of labels) {
      const [k, v] = l.split(":").map((s) => s.trim());
      if (k && v) lines.push(`      ${k}: "${v}"`);
    }
  }

  const ingressRules = input.rules.filter((r) => r.direction === "ingress");
  const egressRules = input.rules.filter((r) => r.direction === "egress");

  lines.push("  policyTypes:");
  if (input.defaultDenyIngress || ingressRules.length) lines.push("  - Ingress");
  if (input.defaultDenyEgress || egressRules.length) lines.push("  - Egress");

  if (ingressRules.length) {
    lines.push("  ingress:");
    for (const r of ingressRules) {
      lines.push(`  - from:`);
      appendPeer(lines, r, 2);
      if (r.port) {
        lines.push("    ports:");
        lines.push(`    - protocol: ${r.protocol}`);
        lines.push(`      port: ${r.port}`);
      }
    }
  }

  if (egressRules.length) {
    lines.push("  egress:");
    for (const r of egressRules) {
      lines.push(`  - to:`);
      appendPeer(lines, r, 2);
      if (r.port) {
        lines.push("    ports:");
        lines.push(`    - protocol: ${r.protocol}`);
        lines.push(`      port: ${r.port}`);
      }
    }
  }

  return lines.join("\n");
}

function appendPeer(lines: string[], r: Rule, base: number) {
  const pad = indent(base + 1);
  switch (r.peerType) {
    case "namespace":
      lines.push(`${pad}namespaceSelector:`);
      lines.push(`${pad}  matchLabels:`);
      lines.push(`${pad}    kubernetes.io/metadata.name: "${r.peerValue}"`);
      break;
    case "podSelector":
      lines.push(`${pad}podSelector:`);
      lines.push(`${pad}  matchLabels:`);
      const [k, v] = r.peerValue.split(":").map((s) => s.trim());
      lines.push(`${pad}    ${k}: "${v}"`);
      break;
    case "cidr":
      lines.push(`${pad}ipBlock:`);
      lines.push(`${pad}  cidr: "${r.peerValue}"`);
      break;
    case "all":
      lines.push(`${pad}{}`);
      break;
  }
}

export function K8sNetworkPolicyGeneratorTool() {
  const [input, setInput] = useState<PolicyInput>(DEFAULTS);
  const yaml = useMemo(() => generatePolicyYaml(input), [input]);

  const update = useCallback(<K extends keyof PolicyInput>(key: K, value: PolicyInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  }, []);

  const addRule = useCallback(() => {
    setInput((prev) => ({
      ...prev,
      rules: [
        ...prev.rules,
        {
          id: `r${Date.now()}`,
          direction: "ingress",
          peerType: "namespace",
          peerValue: "",
          port: "",
          protocol: "TCP",
        },
      ],
    }));
  }, []);

  const removeRule = useCallback((id: string) => {
    setInput((prev) => ({ ...prev, rules: prev.rules.filter((r) => r.id !== id) }));
  }, []);

  const updateRule = useCallback((id: string, patch: Partial<Rule>) => {
    setInput((prev) => ({
      ...prev,
      rules: prev.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  }, []);

  const reset = useCallback(() => setInput(DEFAULTS), []);
  const copy = useCallback(() => navigator.clipboard.writeText(yaml), [yaml]);

  return (
    <Card className="p-6 space-y-6">
      {/* Metadata */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="npName">Policy Name</Label>
          <Input id="npName" value={input.name} onChange={(e) => update("name", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="npNs">Namespace</Label>
          <Input
            id="npNs"
            value={input.namespace}
            onChange={(e) => update("namespace", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="npSel">Pod Selector (key: value, comma-separated)</Label>
          <Input
            id="npSel"
            value={input.podSelector}
            onChange={(e) => update("podSelector", e.target.value)}
            placeholder="app: web, tier: frontend"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={input.defaultDenyIngress}
            onChange={(e) => update("defaultDenyIngress", e.target.checked)}
            className="accent-[hsl(var(--accent))]"
          />
          Default-deny Ingress
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={input.defaultDenyEgress}
            onChange={(e) => update("defaultDenyEgress", e.target.checked)}
            className="accent-[hsl(var(--accent))]"
          />
          Default-deny Egress
        </label>
      </div>

      {/* Rules */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Rules</p>
          <Button variant="outline" size="sm" onClick={addRule}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Rule
          </Button>
        </div>
        {input.rules.map((r) => (
          <div key={r.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase text-muted-foreground">
                {r.direction}
              </span>
              <Button variant="ghost" size="sm" onClick={() => removeRule(r.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-4">
              <select
                className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
                value={r.direction}
                onChange={(e) =>
                  updateRule(r.id, { direction: e.target.value as Rule["direction"] })
                }
              >
                <option value="ingress">ingress</option>
                <option value="egress">egress</option>
              </select>
              <select
                className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
                value={r.peerType}
                onChange={(e) => updateRule(r.id, { peerType: e.target.value as Rule["peerType"] })}
              >
                <option value="namespace">namespace</option>
                <option value="podSelector">podSelector</option>
                <option value="cidr">ipBlock (CIDR)</option>
                <option value="all">all</option>
              </select>
              <Input
                value={r.peerValue}
                onChange={(e) => updateRule(r.id, { peerValue: e.target.value })}
                placeholder={r.peerType === "cidr" ? "10.0.0.0/8" : "namespace or key: value"}
                disabled={r.peerType === "all"}
              />
              <div className="flex gap-1">
                <Input
                  value={r.port}
                  onChange={(e) => updateRule(r.id, { port: e.target.value })}
                  placeholder="port"
                />
                <select
                  className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
                  value={r.protocol}
                  onChange={(e) => updateRule(r.id, { protocol: e.target.value })}
                >
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                  <option value="SCTP">SCTP</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Visual flow */}
      <div className="rounded-lg border border-border bg-muted/20 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Connection Flow
        </p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {input.rules.map((r) => (
            <span
              key={r.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1"
            >
              <span className="font-mono text-accent">{r.direction}</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-foreground">{r.peerValue || r.peerType}</span>
              {r.port && <span className="text-muted-foreground">:{r.port}</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Generated YAML */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Generated NetworkPolicy</p>
          <Button variant="ghost" size="sm" onClick={copy}>
            <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
          </Button>
        </div>
        <pre className="overflow-x-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs text-foreground">
          {yaml}
        </pre>
      </div>

      <Button variant="outline" size="sm" onClick={reset}>
        <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
      </Button>
    </Card>
  );
}

export default K8sNetworkPolicyGeneratorTool;
