import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ChecklistItemObject {
  id?: string;
  label: string;
  checked?: boolean;
}

type ChecklistItem = string | ChecklistItemObject;

interface ChecklistBoxProps {
  title?: string;
  items: ChecklistItem[];
  className?: string;
  storageKey?: string;
}

/**
 * Checklist box for self-audit tools, certification modules, and step-by-step checklists.
 * Supports interactive checking with persistent state in localStorage.
 */
const ChecklistBox = ({
  title = "Checklist",
  items,
  className,
  storageKey,
}: ChecklistBoxProps) => {
  const [checkedState, setCheckedState] = useState<Record<number, boolean>>({});

  const prefix =
    storageKey ||
    (typeof window !== "undefined" ? window.location.pathname : "") + `_${title}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(`checklist_${prefix}`);
      if (saved) {
        setCheckedState(JSON.parse(saved));
      }
    } catch {}
  }, [prefix]);

  const toggle = (idx: number) => {
    setCheckedState((prev) => {
      const next = { ...prev, [idx]: !prev[idx] };
      try {
        localStorage.setItem(`checklist_${prefix}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const completedCount = Object.values(checkedState).filter(Boolean).length;

  return (
    <div className={cn("my-6 rounded-lg border border-border bg-card p-5 shadow-xs", className)}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <span className="text-xs font-mono text-muted-foreground">
          {completedCount} / {items.length} completed
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item, idx) => {
          const text = typeof item === "string" ? item : (item.label ?? String(item));
          const isChecked = Boolean(checkedState[idx]);
          return (
            <li
              key={idx}
              onClick={() => toggle(idx)}
              className="flex items-start gap-2.5 text-sm text-foreground cursor-pointer select-none group"
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={isChecked}
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                  isChecked
                    ? "border-accent bg-accent text-accent-foreground font-bold text-xs"
                    : "border-border bg-background group-hover:border-accent/60"
                )}
              >
                {isChecked ? "✓" : ""}
              </button>
              <span className={cn(isChecked && "line-through text-muted-foreground transition-all")}>
                {text}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export { ChecklistBox };
export default ChecklistBox;
