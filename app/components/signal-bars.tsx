"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Live "signal" equalizer for the hero status panel — a row of gradient bars
 * (teal → violet) that rise and fall in a traveling wave. The only motion is
 * each bar's `scaleY` (GPU-composited, cheap, auto-gated by reduce-motion);
 * resting heights are deterministic so there's no hydration mismatch.
 */
const COUNT = 32;
const TEAL = [45, 212, 191];
const VIOLET = [167, 139, 250];
const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);
const color = (i: number) => {
  const t = i / (COUNT - 1);
  return `rgb(${lerp(TEAL[0], VIOLET[0], t)}, ${lerp(TEAL[1], VIOLET[1], t)}, ${lerp(TEAL[2], VIOLET[2], t)})`;
};
// non-uniform resting heights (deterministic — same on server & client)
const BASE = Array.from({ length: COUNT }, (_, i) => 0.35 + 0.55 * Math.abs(Math.sin(i * 1.7 + 0.6)));

const MASK = "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)";

export function SignalBars({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("flex h-10 items-end gap-[3px] overflow-hidden", className)}
      style={{ maskImage: MASK, WebkitMaskImage: MASK }}
    >
      {Array.from({ length: COUNT }).map((_, i) => (
        <span
          key={i}
          className="signal-bar h-full flex-1 rounded-full"
          style={
            {
              background: color(i),
              "--b": BASE[i].toFixed(2),
              animationDelay: `-${(i * 0.08).toFixed(2)}s`,
              animationDuration: `${(1.1 + (i % 6) * 0.13).toFixed(2)}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
