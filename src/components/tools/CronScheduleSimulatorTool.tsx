import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, RotateCcw, Clock } from "lucide-react";

export type CronFlavor = "linux" | "aws-cloudwatch-rate" | "aws-cloudwatch-cron" | "k8s-cronjob";

export interface CronInput {
  flavor: CronFlavor;
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
  count: number;
}

const DEFAULTS: CronInput = {
  flavor: "linux",
  minute: "0",
  hour: "9",
  dayOfMonth: "*",
  month: "*",
  dayOfWeek: "1-5",
  count: 5,
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseField(field: string, min: number, max: number): number[] {
  const result = new Set<number>();
  for (const part of field.split(",")) {
    const trimmed = part.trim();
    if (!trimmed || trimmed === "*") {
      for (let i = min; i <= max; i++) result.add(i);
      continue;
    }
    // step: a-b/c or */c
    const stepMatch = trimmed.match(/^(\*|\d+-\d+|\d+)\/(\d+)$/);
    if (stepMatch) {
      const range = stepMatch[1];
      const step = parseInt(stepMatch[2]);
      let lo = min;
      let hi = max;
      if (range !== "*") {
        const [a, b] = range.split("-").map(Number);
        lo = a;
        hi = b ?? a;
      }
      for (let i = lo; i <= hi; i += step) result.add(i);
      continue;
    }
    // range a-b
    const rangeMatch = trimmed.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const a = parseInt(rangeMatch[1]);
      const b = parseInt(rangeMatch[2]);
      for (let i = a; i <= b; i++) result.add(i);
      continue;
    }
    const n = parseInt(trimmed);
    if (!isNaN(n)) result.add(n);
  }
  return Array.from(result)
    .filter((v) => v >= min && v <= max)
    .sort((a, b) => a - b);
}

function nextOccurrences(input: CronInput, count: number): Date[] {
  // AWS CloudWatch rate() is a special case — handled separately
  const minutes = parseField(input.minute, 0, 59);
  const hours = parseField(input.hour, 0, 23);
  const doms = parseField(input.dayOfMonth, 1, 31);
  const months = parseField(input.month, 1, 12);
  const dows = parseField(input.dayOfWeek, 0, 6); // 0=Sun

  const results: Date[] = [];
  const now = new Date();
  // start from next minute
  const cursor = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes() + 1,
    0,
    0,
  );

  // safety cap iterations
  let iterations = 0;
  while (results.length < count && iterations < 500000) {
    iterations++;
    if (!months.includes(cursor.getMonth() + 1)) {
      cursor.setMonth(cursor.getMonth() + 1, 1);
      cursor.setHours(0, 0, 0, 0);
      continue;
    }
    const domMatch = doms.includes(cursor.getDate());
    const dowMatch = dows.includes(cursor.getDay());
    // In cron, if both dom and dow are restricted (not *), either matching triggers.
    const domRestricted = input.dayOfMonth !== "*";
    const dowRestricted = input.dayOfWeek !== "*";
    const dayMatch = domRestricted && dowRestricted ? domMatch || dowMatch : domMatch && dowMatch;
    if (!dayMatch) {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(0, 0, 0, 0);
      continue;
    }
    if (!hours.includes(cursor.getHours())) {
      cursor.setHours(cursor.getHours() + 1, 0, 0, 0);
      continue;
    }
    if (!minutes.includes(cursor.getMinutes())) {
      cursor.setMinutes(cursor.getMinutes() + 1, 0, 0);
      continue;
    }
    results.push(new Date(cursor));
    cursor.setMinutes(cursor.getMinutes() + 1, 0, 0);
  }
  return results;
}

function cloudwatchRateNext(
  rate: number,
  unit: "minutes" | "hours" | "days",
  count: number,
): Date[] {
  const results: Date[] = [];
  const now = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(now);
    if (unit === "minutes") d.setMinutes(d.getMinutes() + rate * i);
    else if (unit === "hours") d.setHours(d.getHours() + rate * i);
    else d.setDate(d.getDate() + rate * i);
    results.push(d);
  }
  return results;
}

export function CronScheduleSimulatorTool() {
  const [input, setInput] = useState<CronInput>(DEFAULTS);
  const [rateValue, setRateValue] = useState(5);
  const [rateUnit, setRateUnit] = useState<"minutes" | "hours" | "days">("minutes");

  const isRate = input.flavor === "aws-cloudwatch-rate";

  const occurrences = useMemo(() => {
    if (isRate) return cloudwatchRateNext(rateValue, rateUnit, input.count);
    return nextOccurrences(input, input.count);
  }, [input, isRate, rateValue, rateUnit]);

  const expression = useMemo(
    () => buildExpression(input, rateValue, rateUnit),
    [input, rateValue, rateUnit],
  );

  const humanReadable = useMemo(
    () => describe(input, rateValue, rateUnit),
    [input, rateValue, rateUnit],
  );

  const copy = useCallback(() => {
    navigator.clipboard.writeText(expression);
  }, [expression]);

  const reset = () => {
    setInput(DEFAULTS);
    setRateValue(5);
    setRateUnit("minutes");
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["linux", "Linux cron"],
            ["aws-cloudwatch-cron", "AWS CloudWatch cron"],
            ["aws-cloudwatch-rate", "AWS CloudWatch rate()"],
            ["k8s-cronjob", "K8s CronJob"],
          ] as [CronFlavor, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setInput({ ...input, flavor: id })}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              input.flavor === id
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isRate ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="rate">Every</Label>
            <input
              id="rate"
              type="number"
              min={1}
              value={rateValue}
              onChange={(e) => setRateValue(parseInt(e.target.value) || 1)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="unit">Unit</Label>
            <select
              id="unit"
              value={rateUnit}
              onChange={(e) => setRateUnit(e.target.value as typeof rateUnit)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="minutes">minutes</option>
              <option value="hours">hours</option>
              <option value="days">days</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-5">
          {(
            [
              ["minute", "Minute", "0-59"],
              ["hour", "Hour", "0-23"],
              ["dayOfMonth", "Day (month)", "1-31"],
              ["month", "Month", "1-12"],
              ["dayOfWeek", "Day (week)", "0-6"],
            ] as [keyof CronInput, string, string][]
          ).map(([key, label, hint]) => (
            <div key={key}>
              <Label htmlFor={key}>{label}</Label>
              <input
                id={key}
                value={input[key] as string}
                onChange={(e) => setInput({ ...input, [key]: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="count">Number of upcoming runs</Label>
          <input
            id="count"
            type="number"
            min={1}
            max={20}
            value={input.count}
            onChange={(e) => setInput({ ...input, count: parseInt(e.target.value) || 5 })}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <code className="font-mono text-sm font-semibold text-foreground">{expression}</code>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copy}>
              <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{humanReadable}</p>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Clock className="h-4 w-4" /> Next {occurrences.length} executions (local time)
        </p>
        <ul className="space-y-1.5">
          {occurrences.map((d, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-foreground">
                {DAYS[d.getDay()]}, {MONTHS[d.getMonth()]} {d.getDate()}, {d.getFullYear()}{" "}
                {String(d.getHours()).padStart(2, "0")}:{String(d.getMinutes()).padStart(2, "0")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function buildExpression(input: CronInput, rate: number, unit: string): string {
  if (input.flavor === "aws-cloudwatch-rate") {
    return `rate(${rate} ${unit})`;
  }
  const expr = `${input.minute} ${input.hour} ${input.dayOfMonth} ${input.month} ${input.dayOfWeek}`;
  if (input.flavor === "aws-cloudwatch-cron") {
    // AWS CloudWatch cron uses ? for either DoM or DoW
    let e = expr;
    if (input.dayOfMonth !== "*" && input.dayOfWeek === "*")
      e = `${input.minute} ${input.hour} ${input.dayOfMonth} ${input.month} ?`;
    else if (input.dayOfWeek !== "*" && input.dayOfMonth === "*")
      e = `${input.minute} ${input.hour} ? ${input.month} ${input.dayOfWeek}`;
    return `cron(${e})`;
  }
  if (input.flavor === "k8s-cronjob") {
    return expr;
  }
  return expr;
}

function describe(input: CronInput, rate: number, unit: string): string {
  if (input.flavor === "aws-cloudwatch-rate") {
    return `Runs every ${rate} ${unit === "minutes" ? "minute(s)" : unit}.`;
  }
  const dowNames = input.dayOfWeek === "*" ? "every day" : `on ${input.dayOfWeek}`;
  return `Runs at ${input.minute} past ${input.hour}, ${dowNames}, in month(s) ${input.month}.`;
}

export default CronScheduleSimulatorTool;
