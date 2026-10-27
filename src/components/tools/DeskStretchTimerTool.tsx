import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Timer, Pause, Play, RotateCcw } from "lucide-react";

export interface TimerState {
  focusMinutes: number;
  stretchMinutes: number;
  phase: "focus" | "stretch" | "idle";
  secondsRemaining: number;
  cycleCount: number;
}

const STRETCHES = [
  "Neck rolls — slowly roll head shoulder to shoulder",
  "Shoulder shrugs — lift and release 5 times",
  "Seated spinal twist — hold 15 seconds each side",
  "Wrist flexor stretch — pull fingers back gently",
  "Standing hip flexor opener — 20 seconds each side",
  "Eye focus shift — look near and far 5 times",
  "Ankle circles — 10 rotations each direction",
];

export function DeskStretchTimerTool() {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [stretchMinutes, setStretchMinutes] = useState(3);
  const [phase, setPhase] = useState<"focus" | "stretch" | "idle">("idle");
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStretch = STRETCHES[cycleCount % STRETCHES.length];

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startFocus = useCallback(() => {
    stop();
    setPhase("focus");
    setSecondsRemaining(focusMinutes * 60);
    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          stop();
          setPhase("stretch");
          return stretchMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);
  }, [focusMinutes, stretchMinutes, stop]);

  useEffect(() => {
    if (phase === "stretch" && secondsRemaining === stretchMinutes * 60) {
      intervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            stop();
            setPhase("idle");
            setCycleCount((c) => c + 1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => stop();
  }, [phase, stretchMinutes, stop]);

  const reset = useCallback(() => {
    stop();
    setPhase("idle");
    setSecondsRemaining(0);
    setCycleCount(0);
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="focusMin">Focus Duration (minutes)</Label>
          <input
            id="focusMin"
            type="number"
            min={5}
            max={90}
            value={focusMinutes}
            disabled={phase !== "idle"}
            onChange={(e) => setFocusMinutes(parseInt(e.target.value) || 25)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
          />
        </div>
        <div>
          <Label htmlFor="stretchMin">Stretch Duration (minutes)</Label>
          <input
            id="stretchMin"
            type="number"
            min={1}
            max={10}
            value={stretchMinutes}
            disabled={phase !== "idle"}
            onChange={(e) => setStretchMinutes(parseInt(e.target.value) || 3)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
          />
        </div>
      </div>

      <div className="text-center py-8 rounded-lg bg-muted/30" aria-live="polite">
        {phase === "idle" ? (
          <div>
            <Timer className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Ready to start a focus session</p>
          </div>
        ) : (
          <div>
            <p className="eyebrow mb-2">{phase === "focus" ? "Focus Time" : "Stretch Break"}</p>
            <p className="font-mono text-5xl font-bold text-foreground">
              {formatTime(secondsRemaining)}
            </p>
            {phase === "stretch" && (
              <p className="mt-4 text-sm text-accent-foreground bg-accent/20 rounded-md px-4 py-2 inline-block">
                {currentStretch}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-center gap-2">
        {phase === "idle" || phase === "stretch" ? (
          <Button onClick={startFocus}>
            <Play className="mr-2 h-4 w-4" /> Start Focus
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              stop();
              setPhase("idle");
              setSecondsRemaining(0);
            }}
          >
            <Pause className="mr-2 h-4 w-4" /> Pause
          </Button>
        )}
        <Button variant="outline" onClick={reset}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reset
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Completed cycles: <span className="font-semibold text-foreground">{cycleCount}</span>
      </div>
    </Card>
  );
}

export default DeskStretchTimerTool;
