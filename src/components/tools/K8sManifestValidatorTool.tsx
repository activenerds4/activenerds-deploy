import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

export function validateManifest(yaml: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const info: string[] = [];

  if (!yaml.trim()) {
    return { valid: false, errors: ["Manifest is empty"], warnings, info };
  }

  // Check for apiVersion
  if (!yaml.includes("apiVersion:")) {
    errors.push("Missing apiVersion field");
  }

  // Check for kind
  if (!yaml.includes("kind:")) {
    errors.push("Missing kind field");
  }

  // Check for metadata
  if (!yaml.includes("metadata:")) {
    errors.push("Missing metadata section");
  }

  // Check for name in metadata
  if (yaml.includes("metadata:") && !/metadata:[\s\S]*name:/.test(yaml)) {
    errors.push("Missing metadata.name field");
  }

  // Security warnings
  if (yaml.includes("privileged: true")) {
    warnings.push("Container runs in privileged mode — security risk");
  }

  if (yaml.includes("hostNetwork: true")) {
    warnings.push("hostNetwork: true — containers share host network namespace");
  }

  if (yaml.includes("hostPID: true")) {
    warnings.push("hostPID: true — containers share host PID namespace");
  }

  if (!yaml.includes("resources:") && yaml.includes("kind: Pod")) {
    warnings.push("No resource limits defined — pods may consume excessive resources");
  }

  if (yaml.includes("imagePullPolicy: Always") && yaml.includes(":latest")) {
    info.push("imagePullPolicy: Always with :latest tag — consider using a specific tag");
  }

  if (
    !yaml.includes("securityContext:") &&
    (yaml.includes("kind: Pod") || yaml.includes("kind: Deployment"))
  ) {
    warnings.push("No securityContext defined — consider adding pod/container security context");
  }

  if (yaml.includes("image:") && !yaml.includes(":")) {
    errors.push("Image missing tag — specify a version tag");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
  };
}

export function K8sManifestValidatorTool() {
  const [yaml, setYaml] = useState("");
  const result = useMemo(() => validateManifest(yaml), [yaml]);

  const handleClear = useCallback(() => setYaml(""), []);

  return (
    <Card className="p-6 space-y-4">
      <div>
        <Label htmlFor="manifest">Paste your Kubernetes YAML manifest</Label>
        <textarea
          id="manifest"
          className="mt-2 w-full h-64 rounded-md border border-input bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  ..."
          value={yaml}
          onChange={(e) => setYaml(e.target.value)}
          aria-describedby="validation-results"
        />
      </div>

      <div id="validation-results" className="space-y-2" aria-live="polite">
        {yaml.trim() === "" ? null : result.valid ? (
          <div className="flex items-center gap-2 text-sm font-medium text-accent-foreground">
            <CheckCircle className="h-5 w-5 text-accent" />
            Manifest structure is valid
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm font-medium text-destructive">
            <XCircle className="h-5 w-5" />
            {result.errors.length} error(s) found
          </div>
        )}

        {result.errors.map((err, i) => (
          <div
            key={`err-${i}`}
            className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" /> {err}
          </div>
        ))}

        {result.warnings.map((warn, i) => (
          <div
            key={`warn-${i}`}
            className="flex items-start gap-2 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm text-foreground"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" /> {warn}
          </div>
        ))}

        {result.info.map((msg, i) => (
          <div
            key={`info-${i}`}
            className="flex items-start gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {msg}
          </div>
        ))}
      </div>

      {yaml.trim() !== "" && (
        <Button variant="outline" size="sm" onClick={handleClear}>
          Clear
        </Button>
      )}
    </Card>
  );
}

export default K8sManifestValidatorTool;
