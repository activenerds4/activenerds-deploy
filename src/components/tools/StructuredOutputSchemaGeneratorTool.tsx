import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, RotateCcw, Check } from "lucide-react";

type Provider = "openai" | "anthropic" | "ollama";

interface Field {
  name: string;
  type: string;
  description: string;
  required: boolean;
  enum?: string[];
}

const PRESETS: Record<string, { label: string; fields: Field[] }> = {
  userprofile: {
    label: "User Profile",
    fields: [
      { name: "name", type: "string", description: "Full name", required: true },
      { name: "age", type: "number", description: "Age in years", required: true },
      { name: "email", type: "string", description: "Email address", required: true },
      {
        name: "role",
        type: "string",
        description: "Account role",
        required: true,
        enum: ["admin", "user", "guest"],
      },
      { name: "isActive", type: "boolean", description: "Account active flag", required: false },
    ],
  },
  k8sdeploy: {
    label: "K8s Deployment Request",
    fields: [
      { name: "name", type: "string", description: "Deployment name", required: true },
      { name: "image", type: "string", description: "Container image", required: true },
      { name: "replicas", type: "number", description: "Replica count", required: true },
      { name: "port", type: "number", description: "Container port", required: false },
      { name: "namespace", type: "string", description: "Target namespace", required: false },
    ],
  },
  empty: { label: "Empty", fields: [] },
};

const TYPE_MAP: Record<string, string> = {
  string: "string",
  number: "number",
  boolean: "boolean",
};

function buildSchema(fields: Field[], provider: Provider): string {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const f of fields) {
    const prop: Record<string, unknown> = {
      type: TYPE_MAP[f.type] ?? "string",
      description: f.description,
    };
    if (f.enum) prop.enum = f.enum;
    properties[f.name] = prop;
    if (f.required) required.push(f.name);
  }

  const schema: Record<string, unknown> = {
    type: "object",
    properties,
    required,
    additionalProperties: false,
  };

  if (provider === "openai") {
    return JSON.stringify(
      {
        type: "function",
        function: {
          name: "structured_output",
          description: "Structured output schema",
          parameters: schema,
          strict: true,
        },
      },
      null,
      2,
    );
  }

  if (provider === "anthropic") {
    return JSON.stringify(
      {
        name: "structured_output",
        description: "Structured output schema",
        input_schema: schema,
      },
      null,
      2,
    );
  }

  // ollama
  return JSON.stringify(
    {
      name: "structured_output",
      description: "Structured output schema",
      parameters: {
        type: "object",
        properties: schema.properties,
        required: schema.required,
      },
      format: "json",
    },
    null,
    2,
  );
}

export function StructuredOutputSchemaGeneratorTool() {
  const [provider, setProvider] = useState<Provider>("openai");
  const [preset, setPreset] = useState<string>("userprofile");
  const [fields, setFields] = useState<Field[]>(PRESETS.userprofile.fields);
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => buildSchema(fields, provider), [fields, provider]);

  const applyPreset = (key: string) => {
    setPreset(key);
    setFields(PRESETS[key].fields.map((f) => ({ ...f })));
  };

  const updateField = (idx: number, patch: Partial<Field>) => {
    setFields((prev) => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  };

  const addField = () => {
    setFields((prev) => [
      ...prev,
      { name: `field${prev.length + 1}`, type: "string", description: "", required: false },
    ]);
  };

  const removeField = (idx: number) => {
    setFields((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  return (
    <Card className="p-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="provider">Target provider</Label>
          <select
            id="provider"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={provider}
            onChange={(e) => setProvider(e.target.value as Provider)}
          >
            <option value="openai">OpenAI (function calling, strict)</option>
            <option value="anthropic">Anthropic (tool use, input_schema)</option>
            <option value="ollama">Ollama (JSON format)</option>
          </select>
        </div>
        <div>
          <Label htmlFor="preset">Preset template</Label>
          <select
            id="preset"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={preset}
            onChange={(e) => applyPreset(e.target.value)}
          >
            <option value="userprofile">User Profile</option>
            <option value="k8sdeploy">K8s Deployment Request</option>
            <option value="empty">Empty (start fresh)</option>
          </select>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Fields</p>
          <Button variant="outline" size="sm" onClick={addField}>
            + Add field
          </Button>
        </div>
        <div className="space-y-2">
          {fields.map((f, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-2 rounded-md border border-border bg-background p-2"
            >
              <input
                type="text"
                placeholder="name"
                value={f.name}
                onChange={(e) => updateField(i, { name: e.target.value })}
                className="col-span-3 rounded border border-input bg-background px-2 py-1 text-xs font-mono"
              />
              <select
                value={f.type}
                onChange={(e) => updateField(i, { type: e.target.value })}
                className="col-span-2 rounded border border-input bg-background px-1 py-1 text-xs"
              >
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="boolean">boolean</option>
              </select>
              <input
                type="text"
                placeholder="description"
                value={f.description}
                onChange={(e) => updateField(i, { description: e.target.value })}
                className="col-span-4 rounded border border-input bg-background px-2 py-1 text-xs"
              />
              <input
                type="text"
                placeholder="enum (comma sep)"
                value={f.enum?.join(",") ?? ""}
                onChange={(e) =>
                  updateField(i, {
                    enum: e.target.value
                      ? e.target.value.split(",").map((s) => s.trim())
                      : undefined,
                  })
                }
                className="col-span-2 rounded border border-input bg-background px-2 py-1 text-xs font-mono"
              />
              <label className="col-span-1 flex items-center gap-1 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={f.required}
                  onChange={(e) => updateField(i, { required: e.target.checked })}
                />
                req
              </label>
              <button
                type="button"
                onClick={() => removeField(i)}
                className="col-span-12 text-left text-xs text-destructive hover:underline sm:col-span-1"
              >
                Remove
              </button>
            </div>
          ))}
          {fields.length === 0 && (
            <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              No fields. Add one or load a preset.
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Generated schema</p>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <Check className="mr-2 h-4 w-4 text-accent" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <pre className="max-h-80 overflow-auto rounded-md border border-border bg-muted/30 p-4 text-xs font-mono text-foreground">
          {output}
        </pre>
      </div>

      <Button variant="outline" size="sm" onClick={() => applyPreset("userprofile")}>
        <RotateCcw className="mr-2 h-4 w-4" /> Reset to preset
      </Button>
    </Card>
  );
}

export default StructuredOutputSchemaGeneratorTool;
