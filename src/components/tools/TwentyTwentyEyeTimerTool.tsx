import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * TwentyTwentyEyeTimerTool
 *
 * 20-20-20 rule: every 20 minutes, look at something 20 feet (6m) away
 * for 20 seconds. Adds an optional 60-second thoracic mobility prompt
 * after the eye reset completes.
 *
 * Fully client-side; Web Audio API chime (no assets). State persisted
 * to localStorage so a refresh mid-session resumes cleanly.
 */

const WORK_MINUTES = 20;
const EYE_RESET_SECONDS = 20;
const THORACIC_SECONDS = 60;

const THORACIC_DRILLS = [
  "Thoracic extension: clasp hands behind head, open elbows wide, look up. Hold 10s × 5.",
  "Wall angels: back to wall, arms in goalpost, slide up and down 10x.",
  "Seated spinal twist: cross leg over, twist torso, hold 15s each side.",
  "Shoulder blade squeeze: pull shoulder blades together, hold 5s × 10.",
  "Cat-cow seated: alternate arching and rounding spine, 10 slow reps.",
];

const STORAGE_KEY = "activenerds-2020-timer";

interface PersistedState {
  phase: Phase;
  secondsRemaining: number;
  cyclesCompleted: number;
  soundEnabled: boolean;
  thoracicEnabled: boolean;
}

type Phase = "work" | "eye-reset" | "thoracic" | "idle";

const playChime = (freq: number, duration = 0.6) => {
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
    osc.frequency.value = freq;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start();
    osc.stop(ctx.currentTime + duration);
    osc.onended = () => ctx.close();
  } catch {
    /* AudioContext unavailable */
  }
};

export function TwentyTwentyEyeTimerTool() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [secondsRemaining, setSecondsRemaining] = useState(WORK_MINUTES * 60);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [thoracicEnabled, setThoracicEnabled] = useState(true);
  const [currentDrill, setCurrentDrill] = useState(THORACIC_DRILLS[0]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore persisted state on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as PersistedState;
        if (saved.phase && saved.phase !== "idle") {
          setPhase(saved.phase);
          setSecondsRemaining(saved.secondsRemaining);
          setCyclesCompleted(saved.cyclesCompleted);
          setSoundEnabled(saved.soundEnabled);
          setThoracicEnabled(saved.thoracicEnabled);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Persist state
  useEffect(() => {
    const state: PersistedState = {
      phase,
      secondsRemaining,
      cyclesCompleted,
      soundEnabled,
      thoracicEnabled,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [phase, secondsRemaining, cyclesCompleted, soundEnabled, thoracicEnabled]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    setSecondsRemaining((prev) => {
      if (prev <= 1) {
        // Phase transition
        setPhase((currentPhase) => {
          if (currentPhase === "work") {
            if (soundEnabled) playChime(880, 0.8);
            return "eye-reset";
          }
          if (currentPhase === "eye-reset") {
            if (soundEnabled) playChime(660, 0.5);
            setCyclesCompleted((c) => c + 1);
            if (thoracicEnabled) {
              setCurrentDrill(THORACIC_DRILLS[Math.floor(Math.random() * THORACIC_DRILLS.length)]);
              return "thoracic";
            }
            return "work";
          }
          if (currentPhase === "thoracic") {
            if (soundEnabled) playChime(523, 0.5);
            return "work";
          }
          return currentPhase;
        });
        // Set next phase duration
        return 0; // will be reset by phase-change effect below
      }
      return prev - 1;
    });
  }, [soundEnabled, thoracicEnabled]);

  // Main ticking loop
  useEffect(() => {
    if (phase === "idle") return;
    intervalRef.current = setInterval(tick, 1000);
    return () => stop();
  }, [phase, tick, stop]);

  // When phase changes, reset the countdown to that phase's duration
  const prevPhaseRef = useRef<Phase>("idle");
  useEffect(() => {
    if (phase !== prevPhaseRef.current) {
      if (phase === "work") setSecondsRemaining(WORK_MINUTES * 60);
      else if (phase === "eye-reset") setSecondsRemaining(EYE_RESET_SECONDS);
      else if (phase === "thoracic") setSecondsRemaining(THORACIC_SECONDS);
      prevPhaseRef.current = phase;
    }
  }, [phase]);

  useEffect(() => () => stop(), [stop]);

  const start = () => {
    if (phase === "idle") {
      setPhase("work");
      setSecondsRemaining(WORK_MINUTES * 60);
    }
  };

  const pause = () => {
    stop();
    setPhase("idle");
  };

  const reset = () => {
    stop();
    setPhase("idle");
    setSecondsRemaining(WORK_MINUTES * 60);
    setCyclesCompleted(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const phaseLabel =
    phase === "work"
      ? "Focus block"
      : phase === "eye-reset"
        ? "Eye reset — look 20ft away"
        : phase === "thoracic"
          ? "Mobility break"
          : "Ready";

  const phaseColor =
    phase === "eye-reset"
      ? "text-accent"
      : phase === "thoracic"
        ? "text-primary"
        : "text-foreground";

  const totalForPhase =
    phase === "work"
      ? WORK_MINUTES * 60
      : phase === "eye-reset"
        ? EYE_RESET_SECONDS
        : phase === "thoracic"
          ? THORACIC_SECONDS
          : WORK_MINUTES * 60;
  const pct = totalForPhase > 0 ? ((totalForPhase - secondsRemaining) / totalForPhase) * 100 : 0;

  return (
    <Card className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-accent" />
          <span className="text-sm font-semibold text-foreground">20-20-20 Eye Reset Timer</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled((s) => !s)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            aria-label={soundEnabled ? "Mute chime" : "Unmute chime"}
          >
            {soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5" />
            ) : (
              <VolumeX className="h-3.5 w-3.5" />
            )}
            {soundEnabled ? "Sound on" : "Muted"}
          </button>
          <label className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
            <input
              type="checkbox"
              checked={thoracicEnabled}
              onChange={(e) => setThoracicEnabled(e.target.checked)}
              className="h-3.5 w-3.5 accent-accent"
            />
            Mobility breaks
          </label>
        </div>
      </div>

      <div className="text-center py-10 rounded-lg bg-muted/30" aria-live="polite">
        <p className="eyebrow mb-2">{phaseLabel}</p>
        <p className={cn("font-mono text-6xl font-bold tabular-nums", phaseColor)}>
          {formatTime(secondsRemaining)}
        </p>
        {phase === "thoracic" && (
          <p className="mt-4 mx-auto max-w-sm text-sm text-foreground bg-accent/15 rounded-md px-4 py-2">
            {currentDrill}
          </p>
        )}
        {phase === "eye-reset" && (
          <p className="mt-4 text-sm text-accent">
            Look at something 20 feet (6m) away. Soften your gaze. Blink slowly.
          </p>
        )}
      </div>

      {/* Progress bar */}
      {phase !== "idle" && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-linear",
              phase === "eye-reset"
                ? "bg-accent"
                : phase === "thoracic"
                  ? "bg-primary"
                  : "bg-foreground/60",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <div className="flex justify-center gap-2">
        {phase === "idle" ? (
          <Button onClick={start}>
            <Play className="mr-2 h-4 w-4" /> Start 20-min focus
          </Button>
        ) : (
          <Button variant="outline" onClick={pause}>
            <Pause className="mr-2 h-4 w-4" /> Pause
          </Button>
        )}
        <Button variant="outline" onClick={reset}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reset
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Eye resets completed:{" "}
        <span className="font-semibold text-foreground">{cyclesCompleted}</span>
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">The 20-20-20 rule:</span> Every 20
          minutes, look at something 20 feet away for 20 seconds. Reduces accommodative spasm and
          digital eye strain during long coding and debugging sessions.
        </p>
      </div>
    </Card>
  );
}

export default TwentyTwentyEyeTimerTool;
