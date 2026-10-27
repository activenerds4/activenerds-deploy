/**
 * ActiveNerds Mascot — "Fennec" (Compact Header Mark)
 *
 * A sleek geometric fox head representing the "ActiveNerds" ideal:
 * cleverness, curiosity, and a sharp focused gaze. The fox outsmarts the
 * problem rather than grinding through it — fitting a peer-to-peer,
 * technical-but-human voice.
 *
 * Compact variant: forward-facing fox head used as the header logo mark next
 * to the "ActiveNerds" wordmark. Scales crisply from 20px (favicon) to ~40px
 * (header) via Tailwind sizing classes.
 *
 * Colors use semantic design tokens so it themes automatically in light/dark
 * mode. The accent (teal/spring-green) is used for the inner ears, eyes, and
 * nose — the "active" spark on the deep-slate body.
 */

import { cn } from "@/lib/utils";

export interface ActiveNerdsMarkProps {
  className?: string;
  /** Accessible label for screen readers. Omit to hide from AT. */
  title?: string;
}

export function ActiveNerdsMark({ className, title }: ActiveNerdsMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      className={cn("h-7 w-7 shrink-0", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}

      {/* Outer ears — the fox's alert silhouette */}
      <path
        d="M9 19 L15 4 L21 19 Z"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--accent))"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M27 19 L33 4 L39 19 Z"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--accent))"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Inner ears — the active spark */}
      <path d="M12.5 17.5 L15 8.5 L17.5 17.5 Z" fill="hsl(var(--accent))" />
      <path d="M30.5 17.5 L33 8.5 L35.5 17.5 Z" fill="hsl(var(--accent))" />

      {/* Face shield — the fox's head */}
      <path
        d="M9 18 Q24 15.5 39 18 L33 37 Q24 43 15 37 Z"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--accent))"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Snout / cheek patch */}
      <path d="M16.5 30 L31.5 30 L27.5 40 Q24 42 20.5 40 Z" fill="hsl(var(--muted))" />

      {/* Eyes — sharp focused gaze (diamonds) */}
      <path d="M18 22.5 L20.6 25 L18 27.5 L15.4 25 Z" fill="hsl(var(--accent))" />
      <path d="M30 22.5 L32.6 25 L30 27.5 L27.4 25 Z" fill="hsl(var(--accent))" />
      <circle cx="18" cy="25" r="0.9" fill="hsl(var(--background))" />
      <circle cx="30" cy="25" r="0.9" fill="hsl(var(--background))" />

      {/* Nose */}
      <path d="M24 37.4 L25.7 39 L24 40.6 L22.3 39 Z" fill="hsl(var(--accent))" />
    </svg>
  );
}

export default ActiveNerdsMark;
