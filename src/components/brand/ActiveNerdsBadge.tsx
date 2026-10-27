/**
 * ActiveNerds Mascot — "Fennec" (Badge / Icon Variants)
 *
 * Small reusable variants of the fox mascot for UI affordances:
 *  - ActiveNerdsBadge: a compact fox-glyph inside a rounded badge (New /
 *    contributor / FAQ).
 *  - ActiveNerdsGlyph: an even smaller single-glyph fox head for inline use.
 *
 * All variants theme via design tokens and scale with Tailwind sizing classes.
 */

import { cn } from "@/lib/utils";

/* ── Badge variant ──────────────────────────────────────────────────────── */

export interface ActiveNerdsBadgeProps {
  className?: string;
  /** Optional label text rendered beside the mark */
  label?: string;
  /** Badge tone */
  variant?: "accent" | "muted" | "outline";
}

const badgeVariants: Record<NonNullable<ActiveNerdsBadgeProps["variant"]>, string> = {
  accent: "bg-accent/15 text-accent border-accent/30",
  muted: "bg-muted text-muted-foreground border-border",
  outline: "bg-transparent text-foreground border-border",
};

export function ActiveNerdsBadge({ className, label, variant = "accent" }: ActiveNerdsBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        badgeVariants[variant],
        className,
      )}
    >
      <ActiveNerdsGlyph className="h-3.5 w-3.5" />
      {label ? <span>{label}</span> : null}
    </span>
  );
}

/* ── Glyph variant ──────────────────────────────────────────────────────── */

export interface ActiveNerdsGlyphProps {
  className?: string;
  title?: string;
}

export function ActiveNerdsGlyph({ className, title }: ActiveNerdsGlyphProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      className={cn("h-4 w-4 shrink-0", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      {/* Ears */}
      <path
        d="M9 19 L15 4 L21 19 Z"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M27 19 L33 4 L39 19 Z"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Inner ears */}
      <path d="M12.5 17.5 L15 8.5 L17.5 17.5 Z" fill="hsl(var(--accent))" />
      <path d="M30.5 17.5 L33 8.5 L35.5 17.5 Z" fill="hsl(var(--accent))" />
      {/* Face */}
      <path
        d="M9 18 Q24 15.5 39 18 L33 37 Q24 43 15 37 Z"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Snout patch */}
      <path d="M16.5 30 L31.5 30 L27.5 40 Q24 42 20.5 40 Z" fill="hsl(var(--muted))" />
      {/* Eyes */}
      <path d="M18 22.5 L20.6 25 L18 27.5 L15.4 25 Z" fill="hsl(var(--accent))" />
      <path d="M30 22.5 L32.6 25 L30 27.5 L27.4 25 Z" fill="hsl(var(--accent))" />
      {/* Nose */}
      <path d="M24 37.4 L25.7 39 L24 40.6 L22.3 39 Z" fill="hsl(var(--accent))" />
    </svg>
  );
}

export default ActiveNerdsBadge;
