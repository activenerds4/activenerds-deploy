import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RotateCcw } from "lucide-react";

/* ── Quantization memory multipliers (bytes per parameter) ─────────────── */
const QUANT_BYTES: Record<string, number> = {
  fp32: 4,
  fp16: 2,
  bf16: 2,
  int8: 1,
  gguf_q4_k: 0.55,
  gguf_q4_0: 0.5,
  gguf_q5_k: 0.68,
  gguf_q8_0: 0.85,
  awq_int4: 0.5,
  exl2_4bpw: 0.5,
  exl2_6bpw: 0.75,
  exl2_8bpw: 1.0,
};

const CONTEXT_KV_BYTES = 16; // 2 (k+v) * 8 bytes fp16 per element per layer (approx)

export interface VramInput {
  paramsB: number;
  quant: keyof typeof QUANT_BYTES;
  contextLen: number;
  batchSize: number;
  gpuVramGb: number;
  overheadPct: number;
}

export interface VramResult {
  modelBytes: number;
  modelGb: number;
  kvCacheBytes: number;
  kvCacheGb: number;
  activationGb: number;
  totalVramGb: number;
  fits: boolean;
  numGpusNeeded: number;
  systemRamGb: number;
}

const DEFAULTS: VramInput = {
  paramsB: 7,
  quant: "gguf_q4_k",
  contextLen: 4096,
  batchSize: 1,
  gpuVramGb: 24,
  overheadPct: 10,
};

export function calculateVram(input: VramInput): VramResult {
  const params = input.paramsB * 1e9;
  const bytesPerParam = QUANT_BYTES[input.quant];
  const modelBytes = params * bytesPerParam;
  const modelGb = modelBytes / 1e9;

  // KV cache: 2 * n_layers * n_heads * head_dim * seq_len * batch * 2 bytes
  // Approximate layers/heads from params: rough heuristic ~64 layers for 7B
  const approxLayers = Math.max(1, Math.round(input.paramsB * 8));
  const approxHeads = 32;
  const headDim = 128;
  const kvCacheBytes =
    2 *
    approxLayers *
    approxHeads *
    headDim *
    input.contextLen *
    input.batchSize *
    CONTEXT_KV_BYTES;
  const kvCacheGb = kvCacheBytes / 1e9;

  // Activations: ~0.5GB per 1B params at batch 1, scales with batch
  const activationGb = input.paramsB * 0.05 * input.batchSize;

  const subtotal = modelGb + kvCacheGb + activationGb;
  const overhead = subtotal * (input.overheadPct / 100);
  const totalVramGb = subtotal + overhead;

  const fits = totalVramGb <= input.gpuVramGb;
  const numGpusNeeded = Math.max(1, Math.ceil(totalVramGb / input.gpuVramGb));
  // System RAM should be ~1.5x model size for offload headroom
  const systemRamGb = modelGb * 1.5 + kvCacheGb;

  return {
    modelBytes,
    modelGb,
    kvCacheBytes,
    kvCacheGb,
    activationGb,
    totalVramGb,
    fits,
    numGpusNeeded,
    systemRamGb,
  };
}

export function LlmVramHardwareSizerTool() {
  const [input, setInput] = useState<VramInput>(DEFAULTS);
  const result = useMemo(() => calculateVram(input), [input]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
  }, [result]);

  const reset = () => setInput(DEFAULTS);

  return (
    <Card className="p-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="params">Model Parameters (B)</Label>
          <Input
            id="params"
            type="number"
            min={0.1}
            step={0.1}
            value={input.paramsB}
            onChange={(e) => setInput({ ...input, paramsB: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="quant">Quantization</Label>
          <select
            id="quant"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={input.quant}
            onChange={(e) => setInput({ ...input, quant: e.target.value as VramInput["quant"] })}
          >
            <optgroup label="Full precision">
              <option value="fp32">FP32 (4 B/param)</option>
              <option value="fp16">FP16 (2 B/param)</option>
              <option value="bf16">BF16 (2 B/param)</option>
            </optgroup>
            <optgroup label="GGUF (llama.cpp)">
              <option value="gguf_q4_0">Q4_0 (~0.5 B/param)</option>
              <option value="gguf_q4_k">Q4_K_M (~0.55 B/param)</option>
              <option value="gguf_q5_k">Q5_K_M (~0.68 B/param)</option>
              <option value="gguf_q8_0">Q8_0 (~0.85 B/param)</option>
            </optgroup>
            <optgroup label="AWQ / EXL2">
              <option value="awq_int4">AWQ INT4 (~0.5 B/param)</option>
              <option value="exl2_4bpw">EXL2 4bpw (~0.5 B/param)</option>
              <option value="exl2_6bpw">EXL2 6bpw (~0.75 B/param)</option>
              <option value="exl2_8bpw">EXL2 8bpw (~1.0 B/param)</option>
            </optgroup>
          </select>
        </div>
        <div>
          <Label htmlFor="ctx">Context Length (tokens)</Label>
          <Input
            id="ctx"
            type="number"
            min={512}
            step={512}
            value={input.contextLen}
            onChange={(e) => setInput({ ...input, contextLen: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div>
          <Label htmlFor="batch">Batch Size</Label>
          <Input
            id="batch"
            type="number"
            min={1}
            value={input.batchSize}
            onChange={(e) => setInput({ ...input, batchSize: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div>
          <Label htmlFor="gpu">GPU VRAM (GB)</Label>
          <Input
            id="gpu"
            type="number"
            min={1}
            value={input.gpuVramGb}
            onChange={(e) => setInput({ ...input, gpuVramGb: parseFloat(e.target.value) || 1 })}
          />
        </div>
        <div>
          <Label htmlFor="overhead">Framework Overhead (%)</Label>
          <Input
            id="overhead"
            type="number"
            min={0}
            max={100}
            value={input.overheadPct}
            onChange={(e) => setInput({ ...input, overheadPct: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2" aria-live="polite">
        <Row label="Model weights" value={`${result.modelGb.toFixed(2)} GB`} />
        <Row label="KV cache" value={`${result.kvCacheGb.toFixed(2)} GB`} />
        <Row label="Activations" value={`${result.activationGb.toFixed(2)} GB`} />
        <div className="my-2 border-t border-border" />
        <Row label="Total VRAM needed" value={`${result.totalVramGb.toFixed(2)} GB`} bold />
        <Row
          label="Fits on one GPU?"
          value={result.fits ? "Yes ✓" : `No — needs ${result.numGpusNeeded} GPUs`}
          bold
          accent={result.fits}
        />
        <Row label="Recommended system RAM" value={`${result.systemRamGb.toFixed(1)} GB`} mono />
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" /> Copy JSON
        </Button>
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reset
        </Button>
      </div>
    </Card>
  );
}

function Row({
  label,
  value,
  bold,
  accent,
  mono,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={[
          "text-sm",
          bold ? "font-bold" : "font-semibold",
          mono ? "font-mono" : "",
          accent ? "text-accent" : "text-foreground",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

export default LlmVramHardwareSizerTool;
