import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw, Volume2, VolumeX, PersonStanding } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * SitStandDutyCyclePacerTool
 *
 * Customizable sit-stand interval timer for deep focus sessions.
 * Alternates between sit and stand phases with audio alerts and
 * posture-check prompts. State persisted to localStorage.
 */

const STORAGE_KEY = "activenerds-sitstand-pacer";

const POSTURE_PROMPTS = {
  sit: [
    "Feet flat, thighs parallel to floor, lumbar supported.",
    "Shoulders relaxed, not shrugged toward ears. Chin tucked.",
    "Screen at arm's length, top bezel at eye level.",
    "Wrists neutral — not bent up or down while typing.",
  ],
  stand: [
    "Weight evenly distributed, knees soft (not locked).",
    "Engage core gently. Hips neutral, not tilted forward.",
    "Shift weight heel-to-toe every few minutes.",
    "Screen raised to standing eye level — don't hunch down to a sitting desk.",
  ],
};

interface PersistedState {
  phase: Phase;
  secondsRemaining: number;
  sitMinutes: number;
  standMinutes: number;
  cyclesCompleted: number;
  soundEnabled: boolean;
}

type Phase = "sit" | "stand" | "idle";

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

export function SitStandDutyCyclePacerTool() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [sitMinutes, setSitMinutes] = useState(40);
  const [standMinutes, setStandMinutes] = useState(20);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [promptIndex, setPromptIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore persisted state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as PersistedState;
        if (saved.phase && saved.phase !== "idle") {
          setPhase(saved.phase);
          setSecondsRemaining(saved.secondsRemaining);
          setSitMinutes(saved.sitMinutes);
          setStandMinutes(saved.standMinutes);
          setCyclesCompleted(saved.cyclesCompleted);
          setSoundEnabled(saved.soundEnabled);
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
      sitMinutes,
      standMinutes,
      cyclesCompleted,
      soundEnabled,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [phase, secondsRemaining, sitMinutes, standMinutes, cyclesCompleted, soundEnabled]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    setSecondsRemaining((prev) => {
      if (prev <= 1) {
        // Transition phase
        setPhase((current) => {
          if (current === "sit") {
            if (soundEnabled) playChime(660, 0.8);
            return "stand";
          }
          if (current === "stand") {
            if (soundEnabled) playChime(880, 0.8);
            setCyclesCompleted((c) => c + 1);
            return "sit";
          }
          return current;
        });
        return 0; // reset by phase-change effect
      }
      return prev - 1;
    });
  }, [soundEnabled]);

  useEffect(() => {
    if (phase === "idle") return;
    intervalRef.current = setInterval(tick, 1000);
    return () => stop();
  }, [phase, tick, stop]);

  // Reset countdown when phase changes
  const prevPhaseRef = useRef<Phase>("idle");
  useEffect(() => {
    if (phase !== prevPhaseRef.current) {
      if (phase === "sit") setSecondsRemaining(sitMinutes * 60);
      else if (phase === "stand") setSecondsRemaining(standMinutes * 60);
      setPromptIndex(Math.floor(Math.random() * 4));
      prevPhaseRef.current = phase;
    }
  }, [phase, sitMinutes, standMinutes]);

  useEffect(() => () => stop(), [stop]);

  const start = () => {
    if (phase === "idle") {
      setPhase("sit");
      setSecondsRemaining(sitMinutes * 60);
    }
  };

  const pause = () => {
    stop();
    setPhase("idle");
  };

  const reset = () => {
    stop();
    setPhase("idle");
    setSecondsRemaining(0);
    setCyclesCompleted(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const currentPrompt =
    phase === "sit"
      ? POSTURE_PROMPTS.sit[promptIndex % 4]
      : phase === "stand"
        ? POSTURE_PROMPTS.stand[promptIndex % 4]
        : "";

  const totalForPhase =
    phase === "sit" ? sitMinutes * 60 : phase === "stand" ? standMinutes * 60 : 0;
  const pct = totalForPhase > 0 ? ((totalForPhase - secondsRemaining) / totalForPhase) * 100 : 0;

  const presets = [
    { label: "20/40", sit: 40, stand: 20 },
    { label: "30/30", sit: 30, stand: 30 },
    { label: "45/15", sit: 45, stand: 15 },
    { label: "50/10", sit: 50, stand: 10 },
  ];

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PersonStanding className="h-5 w-5 text-accent" />
          <span className="text-sm font-semibold text-foreground">Sit-Stand Duty Cycle Pacer</span>
        </div>
        <button
          type="button"
          onClick={() => setSoundEnabled((s) => !s)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          aria-label={soundEnabled ? "Mute alerts" : "Unmute alerts"}
        >
          {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          {soundEnabled ? "Sound on" : "Muted"}
        </button>
      </div>

      {phase === "idle" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="sitMin">Sit duration (minutes)</Label>
            <input
              id="sitMin"
              type="number"
              min={10}
              max={120}
              value={sitMinutes}
              onChange={(e) => setSitMinutes(parseInt(e.target.value) || 40)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="standMin">Stand duration (minutes)</Label>
            <input
              id="standMin"
              type="number"
              min={5}
              max={60}
              value={standMinutes}
              onChange={(e) => setStandMinutes(parseInt(e.target.value) || 20)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}

      {phase === "idle" && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Quick presets</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setSitMinutes(p.sit);
                  setStandMinutes(p.stand);
                }}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                  sitMinutes === p.sit && standMinutes === p.stand
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="text-center py-10 rounded-lg bg-muted/30" aria-live="polite">
        {phase === "idle" ? (
          <div>
            <PersonStanding className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {sitMinutes} min sit / {standMinutes} min stand cycle
            </p>
          </div>
        ) : (
          <div>
            <p className="eyebrow mb-2">{phase === "sit" ? "Sitting phase" : "Standing phase"}</p>
            <p
              className={cn(
                "font-mono text-6xl font-bold tabular-nums",
                phase === "sit" ? "text-foreground" : "text-accent",
              )}
            >
              {formatTime(secondsRemaining)}
            </p>
            <p className="mt-4 mx-auto max-w-sm text-sm text-foreground bg-accent/15 rounded-md px-4 py-2">
              {currentPrompt}
            </p>
          </div>
        )}
      </div>

      {phase !== "idle" && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-linear",
              phase === "sit" ? "bg-foreground/60" : "bg-accent",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <div className="flex justify-center gap-2">
        {phase === "idle" ? (
          <Button onClick={start}>
            <Play className="mr-2 h-4 w-4" /> Start cycle
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
        Full cycles completed:{" "}
        <span className="font-semibold text-foreground">{cyclesCompleted}</span>
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">Duty cycle guidance:</span> Start with a
          40/20 sit-stand ratio and adjust to comfort. The goal isn't standing all day — it's
          alternating. Movement frequency matters more than total standing time.
        </p>
      </div>
    </Card>
  );
}

export default SitStandDutyCyclePacerTool;
