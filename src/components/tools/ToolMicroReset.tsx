import { useState, useEffect, useRef, useCallback } from "react";
import { Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ToolMicroReset — a brief 60-second physical reset / posture drill
 * embedded below every ActiveNerds interactive tool. Keeps the
 * "technical-but-human, stay active" ethos woven into the tool surface.
 *
 * Fully client-side; uses the Web Audio API for the chime (no assets).
 */
const DRILLS = [
  "Sit tall. Roll your shoulders back 5x, then forward 5x. Let them drop and breathe.",
  "Stand up. March in place for 30s, then 10 gentle spinal twists.",
  "Chin tucks: draw your chin straight back, hold 3s. Repeat 8x. Resets forward head posture.",
  "Wrist flexor stretch: arm out, palm up, pull fingers down with other hand. Hold 20s each side.",
  "Thoracic extension: clasp hands behind head, open elbows wide, look up. Hold 10s. Repeat 5x.",
  "Hip flexor lunge: step one foot forward, sink hips, squeeze back glute. 30s each side.",
  "Eye resets: look 20ft away for 20s. Then trace a figure-eight with your eyes 5x.",
];

const DURATION = 60;

export function ToolMicroReset() {
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(DURATION);
  const [drill, setDrill] = useState(DRILLS[0]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const playChime = useCallback(() => {
    try {
      const w = window as unknown as {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      };
      const AudioCtx = w.AudioContext ?? w.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
      osc.onended = () => ctx.close();
    } catch {
      /* AudioContext unavailable — silent fallback */
    }
  }, []);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setRunning(false);
          playChime();
          return DURATION;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, playChime]);

  const start = () => {
    setDrill(DRILLS[Math.floor(Math.random() * DRILLS.length)]);
    setRemaining(DURATION);
    setRunning(true);
  };

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRunning(false);
    setRemaining(DURATION);
  };

  const pct = ((DURATION - remaining) / DURATION) * 100;

  return (
    <div className="mt-8 rounded-xl border border-accent/30 bg-accent/5 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            ActiveNerds Micro-Reset
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            60 seconds of movement. You've been focused — give your body a break.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={start}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            <Play className="h-3.5 w-3.5" aria-hidden />
            {running ? "Restart" : "Start 60s"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Reset
          </button>
        </div>
      </div>

      {running && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-foreground">{drill}</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-accent/15">
            <div
              className={cn(
                "h-full rounded-full bg-accent transition-all duration-1000 ease-linear",
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1.5 text-right font-mono text-xs text-muted-foreground">{remaining}s</p>
        </div>
      )}
    </div>
  );
}

export default ToolMicroReset;
