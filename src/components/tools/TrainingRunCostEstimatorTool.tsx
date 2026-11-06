import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Download } from "lucide-react";

export interface CostInput {
  modelParamsB: number;
  batchSize: number;
  sequenceLength: number;
  gpuType: "A100" | "H100" | "V100" | "RTX4090";
  numGpus: number;
  gpuCostPerHour: number;
  trainingSteps: number;
}

export interface CostResult {
  flopsPerStep: number;
  totalFlops: number;
  gpuFlops: number;
  hours: number;
  totalCost: number;
}

const GPU_FLOPS: Record<CostInput["gpuType"], number> = {
  A100: 312e12,
  H100: 989e12,
  V100: 125e12,
  RTX4090: 165e12,
};

export function calculateCost(input: CostInput): CostResult {
  const safeModelParamsB = Math.max(0.01, Math.min(1000, Number(input.modelParamsB) || 0.1));
  const safeBatchSize = Math.max(1, Math.min(65536, Number(input.batchSize) || 1));
  const safeSeqLen = Math.max(128, Math.min(1048576, Number(input.sequenceLength) || 2048));
  const safeNumGpus = Math.max(1, Math.min(16384, Number(input.numGpus) || 1));
  const safeCostPerHour = Math.max(0, Math.min(1000, isNaN(Number(input.gpuCostPerHour)) ? 1 : Number(input.gpuCostPerHour)));
  const rawSteps = Number(input.trainingSteps);
  const safeSteps = isNaN(rawSteps) || rawSteps <= 0 ? 0 : Math.min(10000000, rawSteps);

  const params = safeModelParamsB * 1e9;
  const flopsPerStep = 6 * params * safeBatchSize * safeSeqLen;
  const totalFlops = safeSteps === 0 ? 0 : flopsPerStep * safeSteps;
  const gpuFlops = (GPU_FLOPS[input.gpuType] ?? 312e12) * safeNumGpus;
  const seconds = totalFlops === 0 ? 0 : totalFlops / gpuFlops;
  const hours = seconds / 3600;
  // Multiplies cluster hours by per-GPU hourly rate across all GPUs in the cluster
  const totalCost = hours * safeCostPerHour * safeNumGpus;

  return {
    flopsPerStep,
    totalFlops,
    gpuFlops,
    hours,
    totalCost,
  };
}

const DEFAULTS: CostInput = {
  modelParamsB: 7,
  batchSize: 32,
  sequenceLength: 2048,
  gpuType: "A100",
  numGpus: 8,
  gpuCostPerHour: 3.0,
  trainingSteps: 100000,
};

export function TrainingRunCostEstimatorTool() {
  const [input, setInput] = useState<CostInput>(DEFAULTS);
  const result = useMemo(() => calculateCost(input), [input]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
  }, [result]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "training-cost-estimate.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const isOutOfRange =
    input.modelParamsB <= 0 ||
    input.batchSize <= 0 ||
    input.sequenceLength <= 0 ||
    input.numGpus <= 0 ||
    input.gpuCostPerHour <= 0 ||
    input.trainingSteps <= 0;

  return (
    <Card className="p-6 space-y-6">
      {isOutOfRange && (
        <div
          role="alert"
          className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-400 font-medium"
        >
          ⚠️ Warning: Values must be positive numbers within valid ranges. Calculations have been clamped to safe boundaries.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="modelParams">Model Parameters (B)</Label>
          <Input
            id="modelParams"
            type="number"
            min={0.1}
            step={0.1}
            value={input.modelParamsB}
            onChange={(e) => setInput({ ...input, modelParamsB: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="batchSize">Batch Size</Label>
          <Input
            id="batchSize"
            type="number"
            min={1}
            value={input.batchSize}
            onChange={(e) => setInput({ ...input, batchSize: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div>
          <Label htmlFor="seqLen">Sequence Length</Label>
          <Input
            id="seqLen"
            type="number"
            min={1}
            value={input.sequenceLength}
            onChange={(e) => setInput({ ...input, sequenceLength: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div>
          <Label htmlFor="gpuType">GPU Architecture</Label>
          <select
            id="gpuType"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={input.gpuType}
            onChange={(e) =>
              setInput({ ...input, gpuType: e.target.value as CostInput["gpuType"] })
            }
          >
            <option value="H100">NVIDIA H100 (989 TFLOPS FP16)</option>
            <option value="A100">NVIDIA A100 (312 TFLOPS FP16)</option>
            <option value="V100">NVIDIA V100 (125 TFLOPS FP16)</option>
            <option value="RTX4090">NVIDIA RTX 4090 (165 TFLOPS FP16)</option>
          </select>
        </div>
        <div>
          <Label htmlFor="numGpus">Number of GPUs</Label>
          <Input
            id="numGpus"
            type="number"
            min={1}
            value={input.numGpus}
            onChange={(e) => setInput({ ...input, numGpus: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div>
          <Label htmlFor="gpuCost">GPU Cost ($/hr per GPU)</Label>
          <Input
            id="gpuCost"
            type="number"
            min={0}
            step={0.1}
            value={input.gpuCostPerHour}
            onChange={(e) =>
              setInput({ ...input, gpuCostPerHour: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
        <div>
          <Label htmlFor="steps">Training Steps</Label>
          <Input
            id="steps"
            type="number"
            min={1}
            value={input.trainingSteps}
            onChange={(e) => setInput({ ...input, trainingSteps: parseInt(e.target.value) || 1 })}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2" aria-live="polite">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Cluster Burn Rate:</span>
          <span className="text-sm font-semibold text-foreground">
            ${(input.gpuCostPerHour * input.numGpus).toFixed(2)}/hr ({input.numGpus} GPUs)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Estimated Time:</span>
          <span className="text-sm font-semibold text-foreground">
            {result.hours.toFixed(1)} hours
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Total Estimated Cost:</span>
          <span className="text-lg font-bold text-accent-foreground bg-accent px-3 py-0.5 rounded">
            ${result.totalCost.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Total FLOPs:</span>
          <span className="text-sm font-mono text-foreground">
            {(result.totalFlops / 1e21).toFixed(2)} ZFLOPs
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" /> Copy JSON
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" /> Download
        </Button>
      </div>
    </Card>
  );
}

export default TrainingRunCostEstimatorTool;
