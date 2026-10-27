import { describe, it, expect } from "vitest";
import { calculateCost } from "@/components/tools/TrainingRunCostEstimatorTool";

describe("TrainingRunCostEstimator - calculateCost", () => {
  it("should calculate cost for default inputs", () => {
    const result = calculateCost({
      modelParamsB: 7,
      batchSize: 32,
      sequenceLength: 2048,
      gpuType: "A100",
      numGpus: 8,
      gpuCostPerHour: 3.0,
      trainingSteps: 100000,
    });

    expect(result.totalFlops).toBeGreaterThan(0);
    expect(result.hours).toBeGreaterThan(0);
    expect(result.totalCost).toBeGreaterThan(0);
  });

  it("should handle zero training steps", () => {
    const result = calculateCost({
      modelParamsB: 7,
      batchSize: 32,
      sequenceLength: 2048,
      gpuType: "A100",
      numGpus: 8,
      gpuCostPerHour: 3.0,
      trainingSteps: 0,
    });

    expect(result.totalFlops).toBe(0);
    expect(result.hours).toBe(0);
    expect(result.totalCost).toBe(0);
  });

  it("should scale with more GPUs", () => {
    const base = calculateCost({
      modelParamsB: 7,
      batchSize: 32,
      sequenceLength: 2048,
      gpuType: "A100",
      numGpus: 4,
      gpuCostPerHour: 3.0,
      trainingSteps: 100000,
    });

    const doubled = calculateCost({
      modelParamsB: 7,
      batchSize: 32,
      sequenceLength: 2048,
      gpuType: "A100",
      numGpus: 8,
      gpuCostPerHour: 3.0,
      trainingSteps: 100000,
    });

    expect(doubled.hours).toBeCloseTo(base.hours / 2, 1);
  });
});
