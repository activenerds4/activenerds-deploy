import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RotateCcw } from "lucide-react";

/* ── Unit helpers ─────────────────────────────────────────────────────── */
const CPU_CORES = ["100m", "250m", "500m", "1", "2", "4", "8"];
const MEM_MB = [128, 256, 512, 1024, 2048, 4096, 8192];

export interface ResourceInput {
  replicas: number;
  cpuRequest: number; // millicores
  cpuLimit: number; // millicores
  memRequest: number; // MiB
  memLimit: number; // MiB
  nodeCpu: number; // cores
  nodeMem: number; // GiB
}

export interface ResourceResult {
  totalCpuReq: number; // cores
  totalCpuLim: number;
  totalMemReq: number; // GiB
  totalMemLim: number;
  nodeCpuUtil: number; // %
  nodeMemUtil: number; // %
  podsPerNode: number;
  nodesNeeded: number;
  limitRangeYaml: string;
  resourceQuotaYaml: string;
}

const DEFAULTS: ResourceInput = {
  replicas: 3,
  cpuRequest: 250,
  cpuLimit: 500,
  memRequest: 512,
  memLimit: 1024,
  nodeCpu: 4,
  nodeMem: 16,
};

function mlToCores(ml: number) {
  return ml / 1000;
}
function mibToGib(mib: number) {
  return mib / 1024;
}

export function calculateResources(input: ResourceInput): ResourceResult {
  const totalCpuReq = mlToCores(input.cpuRequest) * input.replicas;
  const totalCpuLim = mlToCores(input.cpuLimit) * input.replicas;
  const totalMemReq = mibToGib(input.memRequest) * input.replicas;
  const totalMemLim = mibToGib(input.memLimit) * input.replicas;

  // Reserve ~10% for system daemons
  const usableCpu = input.nodeCpu * 0.9;
  const usableMem = input.nodeMem * 0.9;
  const podsPerNode = Math.max(
    1,
    Math.floor(
      Math.min(usableCpu / mlToCores(input.cpuRequest), usableMem / mibToGib(input.memRequest)),
    ),
  );
  const nodesNeeded = Math.ceil(input.replicas / podsPerNode);

  const nodeCpuUtil = (totalCpuReq / (nodesNeeded * input.nodeCpu)) * 100;
  const nodeMemUtil = (totalMemReq / (nodesNeeded * input.nodeMem)) * 100;

  const limitRangeYaml = `apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
spec:
  limits:
    - type: Container
      default:
        cpu: "${input.cpuLimit}m"
        memory: "${input.memLimit}Mi"
      defaultRequest:
        cpu: "${input.cpuRequest}m"
        memory: "${input.memRequest}Mi"
      max:
        cpu: "${input.cpuLimit * 2}m"
        memory: "${input.memLimit * 2}Mi"`;

  const resourceQuotaYaml = `apiVersion: v1
kind: ResourceQuota
metadata:
  name: namespace-quota
spec:
  hard:
    requests.cpu: "${totalCpuReq.toFixed(2)}"
    requests.memory: "${totalMemReq.toFixed(1)}Gi"
    limits.cpu: "${totalCpuLim.toFixed(2)}"
    limits.memory: "${totalMemLim.toFixed(1)}Gi"
    pods: "${input.replicas * 2}"`;

  return {
    totalCpuReq,
    totalCpuLim,
    totalMemReq,
    totalMemLim,
    nodeCpuUtil,
    nodeMemUtil,
    podsPerNode,
    nodesNeeded,
    limitRangeYaml,
    resourceQuotaYaml,
  };
}

export function K8sResourceQuotaCalculatorTool() {
  const [input, setInput] = useState<ResourceInput>(DEFAULTS);
  const result = useMemo(() => calculateResources(input), [input]);

  const update = useCallback((key: keyof ResourceInput, value: number) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => setInput(DEFAULTS), []);

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  return (
    <Card className="p-6 space-y-6">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="replicas">Replicas</Label>
          <Input
            id="replicas"
            type="number"
            min={1}
            value={input.replicas}
            onChange={(e) => update("replicas", Math.max(1, Number(e.target.value) || 0))}
          />
        </div>
        <div>
          <Label htmlFor="cpuReq">CPU Request (millicores)</Label>
          <Input
            id="cpuReq"
            type="number"
            min={1}
            value={input.cpuRequest}
            onChange={(e) => update("cpuRequest", Math.max(1, Number(e.target.value) || 0))}
          />
          <div className="mt-1 flex flex-wrap gap-1">
            {CPU_CORES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() =>
                  update("cpuRequest", c.endsWith("m") ? Number(c.slice(0, -1)) : Number(c) * 1000)
                }
                className="rounded border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="cpuLim">CPU Limit (millicores)</Label>
          <Input
            id="cpuLim"
            type="number"
            min={1}
            value={input.cpuLimit}
            onChange={(e) => update("cpuLimit", Math.max(1, Number(e.target.value) || 0))}
          />
        </div>
        <div>
          <Label htmlFor="memReq">Memory Request (MiB)</Label>
          <Input
            id="memReq"
            type="number"
            min={1}
            value={input.memRequest}
            onChange={(e) => update("memRequest", Math.max(1, Number(e.target.value) || 0))}
          />
          <div className="mt-1 flex flex-wrap gap-1">
            {MEM_MB.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => update("memRequest", m)}
                className="rounded border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="memLim">Memory Limit (MiB)</Label>
          <Input
            id="memLim"
            type="number"
            min={1}
            value={input.memLimit}
            onChange={(e) => update("memLimit", Math.max(1, Number(e.target.value) || 0))}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="nodeCpu">Node CPU (cores)</Label>
            <Input
              id="nodeCpu"
              type="number"
              min={1}
              value={input.nodeCpu}
              onChange={(e) => update("nodeCpu", Math.max(1, Number(e.target.value) || 0))}
            />
          </div>
          <div>
            <Label htmlFor="nodeMem">Node Mem (GiB)</Label>
            <Input
              id="nodeMem"
              type="number"
              min={1}
              value={input.nodeMem}
              onChange={(e) => update("nodeMem", Math.max(1, Number(e.target.value) || 0))}
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total CPU Request" value={`${result.totalCpuReq.toFixed(2)} cores`} />
        <Stat label="Total Mem Request" value={`${result.totalMemReq.toFixed(1)} GiB`} />
        <Stat label="Pods / Node" value={`${result.podsPerNode}`} />
        <Stat label="Nodes Needed" value={`${result.nodesNeeded}`} />
      </div>

      {/* Utilization gauge */}
      <div className="space-y-3">
        <Gauge label="Node CPU utilization (requests)" pct={result.nodeCpuUtil} />
        <Gauge label="Node Memory utilization (requests)" pct={result.nodeMemUtil} />
      </div>

      {/* Generated YAML */}
      <div className="space-y-3">
        <YamlBlock
          title="LimitRange"
          yaml={result.limitRangeYaml}
          onCopy={() => copy(result.limitRangeYaml)}
        />
        <YamlBlock
          title="ResourceQuota"
          yaml={result.resourceQuotaYaml}
          onCopy={() => copy(result.resourceQuotaYaml)}
        />
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
        </Button>
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Gauge({ label, pct }: { label: string; pct: number }) {
  const clamped = Math.min(100, pct);
  const color = pct > 85 ? "bg-destructive" : pct > 70 ? "bg-yellow-500" : "bg-accent";
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="font-medium text-foreground">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div className={`h-full ${color} transition-all`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

function YamlBlock({ title, yaml, onCopy }: { title: string; yaml: string; onCopy: () => void }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <Button variant="ghost" size="sm" onClick={onCopy}>
          <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
        </Button>
      </div>
      <pre className="overflow-x-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs text-foreground">
        {yaml}
      </pre>
    </div>
  );
}

export default K8sResourceQuotaCalculatorTool;
