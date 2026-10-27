import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, AlertTriangle, Terminal } from "lucide-react";

export interface ExitCodeInfo {
  code: number;
  signal?: string;
  title: string;
  cause: string;
  symptoms: string[];
  remediation: string[];
  commands: string[];
}

export const EXIT_CODES: ExitCodeInfo[] = [
  {
    code: 137,
    signal: "SIGKILL",
    title: "OOMKilled / Forced Termination",
    cause:
      "The process was killed by SIGKILL. In Kubernetes this is almost always the OOMKiller (container exceeded its memory limit) or a preemption/drain.",
    symptoms: [
      "kubectl describe shows Reason: OOMKilled / Exit Code: 137",
      "Pod restarted with lastState.terminated.reason: OOMKilled",
      "No application stack trace — killed instantly",
      "Memory usage spiked near the limit before death",
    ],
    remediation: [
      "Raise memory limit (resources.limits.memory) or fix a memory leak",
      "Check for unbounded caches, growing buffers, or data loaded into RAM",
      "Add memory requests close to limits to avoid node pressure",
      "If JVM/Python, tune heap flags (-Xmx / PYTHONGC) to stay under the limit",
    ],
    commands: [
      "kubectl describe pod <pod> | grep -A5 'Last State'",
      "kubectl top pod <pod> --containers",
      "kubectl get events --field-selector involvedObject.name=<pod>",
    ],
  },
  {
    code: 139,
    signal: "SIGSEGV",
    title: "Segmentation Fault",
    cause:
      "The process tried to access invalid memory (segfault). Usually a native library bug, corrupted binary, or incompatible CPU/architecture.",
    symptoms: [
      "Exit Code: 139 with no graceful shutdown logs",
      "Core dump may be referenced in dmesg",
      "Happens on specific node types (arch mismatch)",
      "Often after a library upgrade or base image change",
    ],
    remediation: [
      "Rebuild the image for the target architecture (multi-arch builds)",
      "Pin compatible versions of native/C-extension libraries",
      "Check dmesg on the node for segfault traces",
      "Run with a debug image to reproduce and capture a core dump",
    ],
    commands: [
      "kubectl debug node/<node> -it --image=busybox -- chroot /host dmesg | tail",
      "kubectl logs <pod> --previous --tail=100",
    ],
  },
  {
    code: 1,
    title: "General Application Error",
    cause:
      "The container's entrypoint exited with a non-zero status. An uncaught exception, config error, or failed startup check.",
    symptoms: [
      "Exit Code: 1 with application error logs present",
      "Often a missing env var, bad config, or failed DB connection",
      "CrashLoopBackOff if it repeats on restart",
    ],
    remediation: [
      "Read the previous container logs for the actual exception",
      "Verify config maps, secrets, and env vars are mounted",
      "Check startup dependencies (DB, API) are reachable",
      "Fix the failing readiness/startup probe if it exits early",
    ],
    commands: [
      "kubectl logs <pod> --previous",
      "kubectl logs <pod> --previous --tail=200 | grep -i error",
      "kubectl describe pod <pod>",
    ],
  },
  {
    code: 143,
    signal: "SIGTERM",
    title: "Graceful Termination",
    cause:
      "The container received SIGTERM and exited cleanly (128 + 15). This is normal during rolling updates, scale-down, or pod eviction.",
    symptoms: [
      "Exit Code: 143 during a deployment or node drain",
      "Application logged a graceful shutdown message",
      "No error — expected lifecycle event",
    ],
    remediation: [
      "No action needed if it occurred during a rollout",
      "If premature, check terminationGracePeriodSeconds and preStop hooks",
      "Ensure the app handles SIGTERM within the grace period",
      "If killed early (137 instead), the grace period was exceeded",
    ],
    commands: [
      "kubectl get events --field-selector involvedObject.name=<pod>",
      "kubectl rollout status deployment/<name>",
    ],
  },
  {
    code: 2,
    title: "Misuse of Shell Built-in",
    cause:
      "Shell misuse or a missing file passed to a built-in. Often a bad command in an entrypoint script or a missing argument.",
    symptoms: ["Exit Code: 2 from a shell entrypoint", "Often 'file not found' or invalid option"],
    remediation: [
      "Inspect the entrypoint script for invalid flags or missing files",
      "Run the image locally to reproduce: docker run --rm <image>",
      "Quote arguments and validate file paths exist",
    ],
    commands: ["docker run --rm --entrypoint sh <image> -c 'echo $@'", "kubectl logs <pod>"],
  },
];

export function K8sExitCodeDiagnosticsTool() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ExitCodeInfo>(EXIT_CODES[0]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return EXIT_CODES;
    return EXIT_CODES.filter(
      (c) =>
        String(c.code).includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.signal?.toLowerCase().includes(q) ||
        c.symptoms.some((s) => s.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <Card className="p-6 space-y-5">
      <div>
        <Label htmlFor="exitSearch">Search exit code, signal, or symptom</Label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="exitSearch"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 137, OOMKilled, SIGTERM, CrashLoopBackOff"
            className="pl-9"
          />
        </div>
      </div>

      {/* Code chips */}
      <div className="flex flex-wrap gap-2">
        {filtered.map((c) => (
          <button
            key={c.code}
            type="button"
            onClick={() => setSelected(c)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              selected.code === c.code
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="font-mono">{c.code}</span>
            {c.signal && <span className="text-[11px] opacity-70">{c.signal}</span>}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">No matching exit codes.</p>
        )}
      </div>

      {/* Detail */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-destructive/10 px-2 py-0.5 font-mono text-sm font-bold text-destructive">
                {selected.code}
              </span>
              {selected.signal && (
                <span className="rounded-md border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  {selected.signal}
                </span>
              )}
            </div>
            <h3 className="mt-2 text-lg font-semibold text-foreground">{selected.title}</h3>
          </div>
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
        </div>

        <p className="text-sm text-muted-foreground">{selected.cause}</p>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Symptoms
          </p>
          <ul className="space-y-1">
            {selected.symptoms.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Remediation
          </p>
          <ul className="space-y-1">
            {selected.remediation.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Terminal className="h-3.5 w-3.5" /> Diagnostic Commands
          </p>
          <div className="space-y-1.5">
            {selected.commands.map((cmd, i) => (
              <div key={i} className="flex items-center gap-2">
                <code className="flex-1 overflow-x-auto rounded-md border border-border bg-muted/30 px-3 py-1.5 font-mono text-xs text-foreground">
                  {cmd}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(cmd)}
                >
                  Copy
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default K8sExitCodeDiagnosticsTool;
