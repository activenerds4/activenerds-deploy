import { describe, it, expect } from "vitest";
import { validateManifest } from "@/components/tools/K8sManifestValidatorTool";

describe("K8sManifestValidator - validateManifest", () => {
  it("should reject empty input", () => {
    const result = validateManifest("");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Manifest is empty");
  });

  it("should reject missing apiVersion", () => {
    const result = validateManifest("kind: Pod\nmetadata:\n  name: test");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Missing apiVersion field");
  });

  it("should reject missing kind", () => {
    const result = validateManifest("apiVersion: v1\nmetadata:\n  name: test");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Missing kind field");
  });

  it("should warn about privileged mode", () => {
    const result = validateManifest(
      "apiVersion: v1\nkind: Pod\nmetadata:\n  name: test\nspec:\n  containers:\n    - name: test\n      image: nginx:1.21\n      securityContext:\n        privileged: true",
    );
    expect(result.warnings).toContain("Container runs in privileged mode — security risk");
  });

  it("should warn about missing resource limits for pods", () => {
    const result = validateManifest(
      "apiVersion: v1\nkind: Pod\nmetadata:\n  name: test\nspec:\n  containers:\n    - name: test\n      image: nginx:1.21",
    );
    expect(result.warnings).toContain(
      "No resource limits defined — pods may consume excessive resources",
    );
  });

  it("should pass valid manifest", () => {
    const result = validateManifest(
      "apiVersion: v1\nkind: Pod\nmetadata:\n  name: test\nspec:\n  containers:\n    - name: test\n      image: nginx:1.21\n      resources:\n        limits:\n          memory: 128Mi",
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
