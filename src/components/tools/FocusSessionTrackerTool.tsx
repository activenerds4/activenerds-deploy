import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Flame, Trash2 } from "lucide-react";

export interface SessionEntry {
  id: string;
  date: string;
  durationMin: number;
  moved: boolean;
  label: string;
}

export interface TrackerStats {
  totalSessions: number;
  totalMinutes: number;
  movePercentage: number;
  streak: number;
  avgDuration: number;
}

export function calculateStats(sessions: SessionEntry[]): TrackerStats {
  if (sessions.length === 0) {
    return { totalSessions: 0, totalMinutes: 0, movePercentage: 0, streak: 0, avgDuration: 0 };
  }

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMin, 0);
  const movedSessions = sessions.filter((s) => s.moved).length;
  const movePercentage = (movedSessions / sessions.length) * 100;
  const avgDuration = totalMinutes / sessions.length;

  // Calculate streak (consecutive days with at least 1 session)
  const dates = new Set(sessions.map((s) => s.date));
  const today = new Date().toISOString().split("T")[0];
  let streak = 0;
  let checkDate = new Date(today);
  while (dates.has(checkDate.toISOString().split("T")[0])) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return {
    totalSessions: sessions.length,
    totalMinutes,
    movePercentage,
    streak,
    avgDuration,
  };
}

export function FocusSessionTrackerTool() {
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [duration, setDuration] = useState(25);
  const [label, setLabel] = useState("");
  const [moved, setMoved] = useState(true);

  const stats = useMemo(() => calculateStats(sessions), [sessions]);

  const addSession = useCallback(() => {
    const entry: SessionEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split("T")[0],
      durationMin: duration,
      moved,
      label: label || "Focus session",
    };
    setSessions((prev) => [entry, ...prev]);
    setLabel("");
  }, [duration, label, moved]);

  const removeSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <Card className="p-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <input
            id="duration"
            type="number"
            min={5}
            max={120}
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 25)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <Label htmlFor="label">Label (optional)</Label>
          <input
            id="label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Deep work on K8s"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <Label htmlFor="moved">Moved during session?</Label>
          <select
            id="moved"
            value={moved ? "yes" : "no"}
            onChange={(e) => setMoved(e.target.value === "yes")}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>

      <Button onClick={addSession} className="w-full sm:w-auto">
        <Plus className="mr-2 h-4 w-4" /> Log Focus Session
      </Button>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
          <p className="text-xs text-muted-foreground">Sessions</p>
          <p className="text-xl font-bold text-foreground">{stats.totalSessions}</p>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
          <p className="text-xs text-muted-foreground">Total Time</p>
          <p className="text-xl font-bold text-foreground">{stats.totalMinutes}m</p>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
          <p className="text-xs text-muted-foreground">Move Rate</p>
          <p className="text-xl font-bold text-accent-foreground">
            {stats.movePercentage.toFixed(0)}%
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
          <p className="text-xs text-muted-foreground">Streak</p>
          <p className="text-xl font-bold text-foreground flex items-center justify-center gap-1">
            <Flame className="h-4 w-4 text-accent" /> {stats.streak}
          </p>
        </div>
      </div>

      <div className="space-y-2" aria-live="polite">
        {sessions.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">
            No sessions logged yet. Start your first focus block above.
          </p>
        ) : (
          sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2"
            >
              <div>
                <span className="text-sm font-medium text-foreground">{s.label}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {s.date} · {s.durationMin}m
                </span>
              </div>
              <div className="flex items-center gap-2">
                {s.moved && <span className="text-xs text-accent">Moved</span>}
                <Button variant="ghost" size="sm" onClick={() => removeSession(s.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

export default FocusSessionTrackerTool;
