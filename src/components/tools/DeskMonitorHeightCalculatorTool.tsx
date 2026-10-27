import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, RotateCcw, Monitor, Ruler } from "lucide-react";

/**
 * DeskMonitorHeightCalculatorTool
 *
 * Calculates ergonomic desk height, monitor height, and viewing angle
 * from user height, footwear, and anti-fatigue mat thickness.
 *
 * Reference formulas (BIFMA / ergonomic anthropometry):
 *  - Desk height (sitting) ≈ 0.43 × body height (cm)
 *  - Desk height (standing) ≈ 0.57 × body height (cm)
 *  - Monitor top edge at eye level; center ≈ 15-20° below horizontal eye line
 *  - Eye-to-screen distance ≈ arm's length (≈ 0.35 × body height, clamped)
 *  - Footwear/mat adjust desk height up by sole + mat thickness
 */

export interface ErgoInput {
  bodyHeightCm: number;
  footwearCm: number;
  matCm: number;
  mode: "sitting" | "standing";
}

export interface ErgoResult {
  deskHeightCm: number;
  deskHeightIn: number;
  eyeHeightCm: number;
  monitorTopCm: number;
  monitorCenterCm: number;
  viewingDistanceCm: number;
  downwardTiltDeg: number;
  elbowDeskDeltaCm: number;
  notes: string[];
}

const cmToIn = (cm: number) => cm / 2.54;
const round1 = (n: number) => Math.round(n * 10) / 10;

export function calculateErgonomics(input: ErgoInput): ErgoResult {
  const { bodyHeightCm, footwearCm, matCm, mode } = input;

  // Effective standing height (body + footwear + mat if standing)
  const effectiveHeight =
    mode === "standing" ? bodyHeightCm + footwearCm + matCm : bodyHeightCm + footwearCm;

  // Desk height
  const baseDesk = mode === "standing" ? 0.57 * bodyHeightCm : 0.43 * bodyHeightCm;
  const deskHeightCm = round1(baseDesk + (mode === "standing" ? footwearCm + matCm : footwearCm));

  // Eye height (standing) ≈ 0.934 × body height; seated eye height ≈ 0.525 × body height
  const eyeHeightCm = round1(
    mode === "standing" ? 0.934 * effectiveHeight : 0.525 * bodyHeightCm + footwearCm,
  );

  // Monitor: top edge at eye level, center 15-20° below (use 17.5° midpoint)
  const downwardTiltDeg = 17.5;
  // Viewing distance ≈ arm's length ≈ 0.35 × body height, clamped 50-80 cm
  const viewingDistanceCm = round1(Math.min(80, Math.max(50, 0.35 * bodyHeightCm)));
  // Vertical drop from eye line to monitor center = tan(tilt) × distance
  const dropCm = round1(Math.tan((downwardTiltDeg * Math.PI) / 180) * viewingDistanceCm);
  const monitorTopCm = round1(eyeHeightCm);
  const monitorCenterCm = round1(eyeHeightCm - dropCm);

  // Elbow should rest ~2-3 cm above desk surface (90° elbow flexion)
  const elbowDeskDeltaCm = 2.5;

  const notes: string[] = [];
  if (deskHeightCm > 75 && mode === "sitting") {
    notes.push(
      "Desk height is above standard 75 cm — consider a taller chair or footrest to keep 90° elbow angle.",
    );
  }
  if (viewingDistanceCm < 60) {
    notes.push("Screen is closer than 60 cm — push it back to arm's length to reduce eye strain.");
  }
  if (mode === "standing") {
    notes.push(
      "Use an anti-fatigue mat and shift weight every 10-15 minutes. Keep knees soft, not locked.",
    );
  } else {
    notes.push(
      "Feet flat on floor or footrest; thighs parallel to ground. Lumbar support engaged.",
    );
  }
  notes.push(
    "Top of monitor bezel should sit at eye level — tilt screen up 10-20° only if wearing bifocals.",
  );

  return {
    deskHeightCm,
    deskHeightIn: round1(cmToIn(deskHeightCm)),
    eyeHeightCm,
    monitorTopCm,
    monitorCenterCm,
    viewingDistanceCm,
    downwardTiltDeg,
    elbowDeskDeltaCm,
    notes,
  };
}

const DEFAULTS: ErgoInput = {
  bodyHeightCm: 178,
  footwearCm: 2.5,
  matCm: 1.5,
  mode: "sitting",
};

export function DeskMonitorHeightCalculatorTool() {
  const [input, setInput] = useState<ErgoInput>(DEFAULTS);
  const result = useMemo(() => calculateErgonomics(input), [input]);

  const update = useCallback(
    (patch: Partial<ErgoInput>) => setInput((prev) => ({ ...prev, ...patch })),
    [],
  );

  const reset = () => setInput(DEFAULTS);

  const summary = [
    `Desk height: ${result.deskHeightCm} cm (${result.deskHeightIn} in)`,
    `Eye height: ${result.eyeHeightCm} cm`,
    `Monitor top edge: ${result.monitorTopCm} cm`,
    `Monitor center: ${result.monitorCenterCm} cm`,
    `Viewing distance: ${result.viewingDistanceCm} cm`,
    `Downward gaze: ${result.downwardTiltDeg}°`,
  ].join("\n");

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(summary);
  }, [summary]);

  return (
    <Card className="p-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="height">Your height (cm)</Label>
          <input
            id="height"
            type="number"
            min={140}
            max={210}
            value={input.bodyHeightCm}
            onChange={(e) => update({ bodyHeightCm: parseFloat(e.target.value) || 178 })}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <Label htmlFor="mode">Posture mode</Label>
          <select
            id="mode"
            value={input.mode}
            onChange={(e) => update({ mode: e.target.value as "sitting" | "standing" })}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="sitting">Sitting</option>
            <option value="standing">Standing</option>
          </select>
        </div>
        <div>
          <Label htmlFor="footwear">Footwear sole thickness (cm)</Label>
          <input
            id="footwear"
            type="number"
            min={0}
            max={6}
            step={0.5}
            value={input.footwearCm}
            onChange={(e) => update({ footwearCm: parseFloat(e.target.value) || 0 })}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <Label htmlFor="mat">Anti-fatigue mat thickness (cm)</Label>
          <input
            id="mat"
            type="number"
            min={0}
            max={4}
            step={0.5}
            value={input.matCm}
            disabled={input.mode !== "standing"}
            onChange={(e) => update({ matCm: parseFloat(e.target.value) || 0 })}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Monitor className="h-5 w-5 text-accent" />
          <span className="text-sm font-semibold text-foreground">Recommended measurements</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ResultRow
            icon={<Ruler className="h-4 w-4" />}
            label="Desk height"
            value={`${result.deskHeightCm} cm / ${result.deskHeightIn} in`}
          />
          <ResultRow
            icon={<Monitor className="h-4 w-4" />}
            label="Eye height"
            value={`${result.eyeHeightCm} cm`}
          />
          <ResultRow
            icon={<Monitor className="h-4 w-4" />}
            label="Monitor top edge"
            value={`${result.monitorTopCm} cm`}
          />
          <ResultRow
            icon={<Monitor className="h-4 w-4" />}
            label="Monitor center"
            value={`${result.monitorCenterCm} cm`}
          />
          <ResultRow
            icon={<Ruler className="h-4 w-4" />}
            label="Viewing distance"
            value={`${result.viewingDistanceCm} cm`}
          />
          <ResultRow
            icon={<Monitor className="h-4 w-4" />}
            label="Downward gaze"
            value={`${result.downwardTiltDeg}°`}
          />
        </div>
      </div>

      <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
        <p className="mb-2 text-sm font-semibold text-foreground">Setup notes</p>
        <ul className="space-y-1.5">
          {result.notes.map((n, i) => (
            <li key={i} className="text-sm text-muted-foreground">
              <span className="text-accent">→</span> {n}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" /> Copy summary
        </Button>
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reset
        </Button>
      </div>
    </Card>
  );
}

function ResultRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="font-mono text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

export default DeskMonitorHeightCalculatorTool;
