import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Cpu,
  Activity,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  HardDrive,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── LLM Quick Sizer Logic ──────────────────────────────────────────────── */

interface ModelPreset {
  name: string;
  paramsB: number;
}

const MODEL_PRESETS: ModelPreset[] = [
  { name: "Llama-3 8B", paramsB: 8 },
  { name: "Mistral 7B", paramsB: 7 },
  { name: "DeepSeek 16B", paramsB: 16 },
  { name: "Llama-3 70B", paramsB: 70 },
];

const QUANT_OPTIONS = [
  { id: "q4", label: "4-bit (Q4 / AWQ)", bytesPerParam: 0.55 },
  { id: "q8", label: "8-bit (INT8)", bytesPerParam: 1.0 },
  { id: "fp16", label: "16-bit (FP16)", bytesPerParam: 2.0 },
];

const CONTEXT_OPTIONS = [
  { label: "4K", tokens: 4096 },
  { label: "8K", tokens: 8192 },
  { label: "32K", tokens: 32768 },
  { label: "128K", tokens: 131072 },
];

function calculateQuickVram(paramsB: number, bytesPerParam: number, contextLen: number) {
  const modelGb = (paramsB * 1e9 * bytesPerParam) / 1e9;
  // KV Cache approximation: 2 * layers * heads * dim * tokens * 2 bytes
  const approxLayers = Math.max(1, Math.round(paramsB * 8));
  const kvCacheGb = (2 * approxLayers * 32 * 128 * contextLen * 1 * 16) / 1e9;
  const activationsGb = paramsB * 0.05;
  const subtotal = modelGb + kvCacheGb + activationsGb;
  const totalWithOverhead = subtotal * 1.1; // 10% overhead

  return {
    modelGb,
    kvCacheGb,
    totalVramGb: Math.max(1, totalWithOverhead),
  };
}

/* ── Ergonomic Micro-Break Routines ─────────────────────────────────────── */

interface MicroBreakRoutine {
  id: string;
  name: string;
  duration: number; // in seconds
  cue: string;
}

const routines: MicroBreakRoutine[] = [
  {
    id: "eye-reset",
    name: "20-20-20 Eye Reset",
    duration: 20,
    cue: "Look at an object at least 20 feet away to release ciliary muscle tension.",
  },
  {
    id: "thoracic-stretch",
    name: "Thoracic Spine Reset",
    duration: 45,
    cue: "Interlace fingers behind head, pull elbows back, and gently extend upper thoracic spine.",
  },
  {
    id: "wrist-shakeout",
    name: "Wrist & Forearm Release",
    duration: 60,
    cue: "Gently extend your wrist back, rotate both hands, and shake out forearm muscles.",
  },
];

export const CommunityInteractiveHub = () => {
  // LLM Sizer State
  const [selectedModel, setSelectedModel] = useState<ModelPreset>(MODEL_PRESETS[0]);
  const [selectedQuant, setSelectedQuant] = useState(QUANT_OPTIONS[0]);
  const [selectedContext, setSelectedContext] = useState(CONTEXT_OPTIONS[1]); // 8K

  const vramResult = useMemo(() => {
    return calculateQuickVram(
      selectedModel.paramsB,
      selectedQuant.bytesPerParam,
      selectedContext.tokens,
    );
  }, [selectedModel, selectedQuant, selectedContext]);

  // Desk Timer State
  const [selectedRoutine, setSelectedRoutine] = useState<MicroBreakRoutine>(routines[0]);
  const [timeLeft, setTimeLeft] = useState<number>(routines[0].duration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    setTimeLeft(selectedRoutine.duration);
    setIsRunning(false);
    setIsCompleted(false);
  }, [selectedRoutine]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      setIsCompleted(true);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const toggleTimer = () => {
    if (isCompleted) {
      setTimeLeft(selectedRoutine.duration);
      setIsCompleted(false);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setTimeLeft(selectedRoutine.duration);
  };

  const progressPercent =
    ((selectedRoutine.duration - timeLeft) / selectedRoutine.duration) * 100;

  // GPU Hardware recommendation
  const hardwareFit = useMemo(() => {
    const gb = vramResult.totalVramGb;
    if (gb <= 12) return { text: "Fits on 1x RTX 4070 (12GB) / Mac 16GB", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30" };
    if (gb <= 16) return { text: "Fits on 1x RTX 4080 (16GB) / Mac 18GB", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30" };
    if (gb <= 24) return { text: "Fits on 1x RTX 4090 / 3090 (24GB)", color: "text-accent", bg: "bg-accent/10 border-accent/30" };
    if (gb <= 48) return { text: "Requires 2x RTX 4090 (48GB) or Mac 64GB", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30" };
    return { text: "Requires Multi-GPU Server (2x-4x A100 / H100)", color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/30" };
  }, [vramResult.totalVramGb]);

  return (
    <section className="py-12 sm:py-16 border-t border-border/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-mono font-medium text-accent mb-2">
            <Cpu className="h-3.5 w-3.5" />
            Developer Workstation Playground
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
            Hardware Sizing & Desk Longevity
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-muted-foreground max-w-2xl">
            Estimate GPU VRAM requirements for local LLM inference and take a 30-second ergonomic reset while your weights load.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Column 1: Interactive LLM VRAM Quick-Calculator (7 cols) */}
          <div className="lg:col-span-7 rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-5">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    LLM VRAM & Hardware Quick-Sizer
                  </h3>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-mono text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
                  <Sparkles className="h-3 w-3" />
                  Live Calc
                </span>
              </div>

              {/* Step 1: Model Preset */}
              <div className="mb-4">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-2 font-semibold">
                  1. Model Architecture
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MODEL_PRESETS.map((m) => (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => setSelectedModel(m)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-xs font-semibold text-center transition-all",
                        selectedModel.name === m.name
                          ? "border-accent bg-accent/15 text-accent shadow-xs"
                          : "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Quantization & Context */}
              <div className="grid sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-2 font-semibold">
                    2. Precision / Quantization
                  </label>
                  <div className="space-y-1.5">
                    {QUANT_OPTIONS.map((q) => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setSelectedQuant(q)}
                        className={cn(
                          "w-full text-left rounded-md px-3 py-1.5 text-xs font-medium border transition-colors flex items-center justify-between",
                          selectedQuant.id === q.id
                            ? "border-accent bg-accent/10 text-accent font-semibold"
                            : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <span>{q.label}</span>
                        <span className="text-[10px] font-mono opacity-80">
                          ~{q.bytesPerParam}B/param
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-2 font-semibold">
                    3. Context Window Length
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONTEXT_OPTIONS.map((c) => (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => setSelectedContext(c)}
                        className={cn(
                          "rounded-md border py-2 text-xs font-semibold text-center transition-colors",
                          selectedContext.label === c.label
                            ? "border-accent bg-accent/10 text-accent font-bold"
                            : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        {c.label} tokens
                      </button>
                    ))}
                  </div>

                  {/* Quick VRAM Result Card */}
                  <div className="mt-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">Required VRAM:</span>
                      <span className="text-lg font-mono font-bold text-foreground">
                        {vramResult.totalVramGb.toFixed(1)} GB
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground/80 flex justify-between">
                      <span>Weights: {vramResult.modelGb.toFixed(1)}GB</span>
                      <span>KV Cache: {vramResult.kvCacheGb.toFixed(1)}GB</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hardware Recommendation Pill */}
              <div
                className={cn(
                  "rounded-lg border px-3.5 py-2 text-xs font-semibold flex items-center justify-between",
                  hardwareFit.bg,
                  hardwareFit.color,
                )}
              >
                <span>Recommended Hardware:</span>
                <span className="font-mono">{hardwareFit.text}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Need multi-batch & offload sizing?</span>
              <Link
                to="/tools/llm-vram-hardware-sizer"
                className="font-semibold text-accent hover:underline flex items-center gap-1"
              >
                Launch Full LLM Sizer <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Column 2: Active Desk Micro-Break Timer (5 cols) */}
          <div className="lg:col-span-5 rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Active Desk Micro-Break
                  </h3>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
                  In-Browser
                </span>
              </div>

              {/* Routine Selector Tabs */}
              <div className="flex gap-1.5 p-1 bg-muted/60 rounded-lg mb-5">
                {routines.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRoutine(r)}
                    className={cn(
                      "flex-1 text-center py-1.5 px-2 rounded-md text-xs font-medium transition-colors",
                      selectedRoutine.id === r.id
                        ? "bg-card text-foreground font-semibold shadow-2xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {r.name.split(" ")[0]}
                  </button>
                ))}
              </div>

              {/* Timer Display */}
              <div className="text-center p-6 rounded-xl bg-muted/30 border border-border/50 relative overflow-hidden mb-5">
                {/* Progress bar line */}
                <div
                  className="absolute bottom-0 left-0 h-1 bg-accent transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />

                <div className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-1">
                  00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                </div>

                <p className="text-xs font-medium text-accent uppercase tracking-wider mb-2">
                  {selectedRoutine.name}
                </p>

                <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  {isCompleted ? "🎉 Nice reset! Ready to return to flow state." : selectedRoutine.cue}
                </p>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={toggleTimer}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-5 py-2 text-xs font-semibold shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                    isRunning
                      ? "bg-muted text-foreground hover:bg-muted/80"
                      : "bg-accent text-accent-foreground hover:bg-accent/90",
                  )}
                >
                  {isRunning ? (
                    <>
                      <Pause className="h-3.5 w-3.5" /> Pause
                    </>
                  ) : isCompleted ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Repeat Routine
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" /> Start Reset
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetTimer}
                  title="Reset timer"
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Need a full sit-stand duty pacer?</span>
              <Link
                to="/tools/sit-stand-duty-cycle-pacer"
                className="font-semibold text-accent hover:underline flex items-center gap-1"
              >
                Sit-Stand Pacer <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityInteractiveHub;
