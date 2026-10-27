/**
 * ActiveNerds Mascot — "Fennec" (Hero Illustration)
 *
 * Detailed, larger variant of the fox mascot for the homepage hero. Depicts an
 * alert fox in profile, mid-stride with its bushy accent tail raised — the
 * "active" in ActiveNerds — set against a subtle technical grid with a network
 * of orbital nodes and connection lines nodding to distributed systems.
 *
 * Pure inline SVG — no images, scales to any size, themes via design tokens.
 */

import { cn } from "@/lib/utils";

export interface ActiveNerdsHeroProps {
  className?: string;
  title?: string;
}

export function ActiveNerdsHero({ className, title }: ActiveNerdsHeroProps) {
  return (
    <svg
      viewBox="0 0 480 480"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      className={cn("h-full w-full", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}

      <defs>
        {/* Accent glow behind the fox */}
        <radialGradient id="an-fox-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.45" />
          <stop offset="60%" stopColor="hsl(var(--accent))" stopOpacity="0.10" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
        </radialGradient>
        {/* Subtle fill for orbital nodes */}
        <linearGradient id="an-fox-node" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--muted))" />
        </linearGradient>
      </defs>

      {/* Backdrop grid — technical texture */}
      <g stroke="hsl(var(--border))" strokeWidth="1" opacity="0.45">
        {Array.from({ length: 13 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="480" />
        ))}
        {Array.from({ length: 13 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 40} x2="480" y2={i * 40} />
        ))}
      </g>

      {/* Glow halo */}
      <circle cx="240" cy="250" r="170" fill="url(#an-fox-glow)" />

      {/* Orbital network — distributed-systems nod */}
      <g>
        <circle
          cx="240"
          cy="250"
          r="170"
          stroke="hsl(var(--accent))"
          strokeWidth="1.4"
          strokeDasharray="4 9"
          opacity="0.4"
        />
        <g stroke="hsl(var(--accent))" strokeWidth="1.4" opacity="0.5">
          <line x1="240" y1="250" x2="80" y2="120" />
          <line x1="240" y1="250" x2="410" y2="110" />
          <line x1="240" y1="250" x2="420" y2="360" />
          <line x1="240" y1="250" x2="70" y2="380" />
        </g>
        {[
          [80, 120],
          [410, 110],
          [420, 360],
          [70, 380],
        ].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx} ${cy})`}>
            <path
              d="M0 -15 L12.99 -7.5 V7.5 L0 15 L-12.99 7.5 V-7.5 Z"
              fill="url(#an-fox-node)"
              stroke="hsl(var(--accent))"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle r="3.5" fill="hsl(var(--accent))" opacity="0.9" />
          </g>
        ))}
      </g>

      {/* ── The fox (facing right, mid-stride, tail raised) ─────────────────── */}

      {/* Bushy tail (accent) — the "active" signature */}
      <path
        d="M205 285 C150 285 104 244 110 178 C113 144 138 120 170 130 C150 152 152 184 180 202 C200 215 214 240 214 262 C214 272 210 280 205 285 Z"
        fill="hsl(var(--accent))"
        stroke="hsl(var(--accent))"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.95"
      />
      {/* Tail tip highlight */}
      <path
        d="M170 130 C150 152 152 184 180 202"
        stroke="hsl(var(--background))"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.25"
      />

      {/* Far legs (behind) */}
      <rect x="200" y="328" width="9" height="56" rx="4.5" fill="hsl(var(--muted))" />
      <rect x="296" y="328" width="9" height="56" rx="4.5" fill="hsl(var(--muted))" />

      {/* Body */}
      <path
        d="M300 250 C268 252 218 258 198 282 C186 297 190 320 206 332 C236 346 282 346 306 332 C323 322 326 300 318 282 C312 268 308 258 300 250 Z"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Belly / chest patch */}
      <path
        d="M250 300 C236 304 224 314 224 326 C224 338 240 344 262 344 C286 344 300 338 300 326 C300 312 286 302 270 300 Z"
        fill="hsl(var(--muted))"
        opacity="0.9"
      />

      {/* Near legs */}
      <rect
        x="216"
        y="330"
        width="10"
        height="58"
        rx="5"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--accent))"
        strokeWidth="1.5"
      />
      <rect
        x="312"
        y="330"
        width="10"
        height="58"
        rx="5"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--accent))"
        strokeWidth="1.5"
      />

      {/* Head */}
      <circle
        cx="326"
        cy="206"
        r="46"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
      />

      {/* Snout */}
      <path
        d="M352 196 C380 200 396 214 388 228 C374 230 354 224 342 214 Z"
        fill="hsl(var(--muted))"
        stroke="hsl(var(--accent))"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* Ears */}
      <path
        d="M300 170 L292 116 L324 166 Z"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--accent))"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M334 166 L352 116 L348 172 Z"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--accent))"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Inner ears */}
      <path d="M301 165 L297 128 L318 164 Z" fill="hsl(var(--accent))" />
      <path d="M336 164 L350 128 L346 168 Z" fill="hsl(var(--accent))" />

      {/* Eye — sharp focused gaze */}
      <circle cx="344" cy="200" r="5.5" fill="hsl(var(--accent))" />
      <circle cx="345" cy="199" r="1.9" fill="hsl(var(--background))" />

      {/* Nose */}
      <circle cx="386" cy="222" r="3.6" fill="hsl(var(--accent))" />

      {/* Whisker suggestion — subtle accent lines */}
      <g stroke="hsl(var(--accent))" strokeWidth="1.2" strokeLinecap="round" opacity="0.55">
        <line x1="356" y1="216" x2="372" y2="214" />
        <line x1="356" y1="222" x2="374" y2="224" />
      </g>
    </svg>
  );
}

export default ActiveNerdsHero;
