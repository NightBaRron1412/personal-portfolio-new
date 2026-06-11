"use client";

import { cn } from "@/lib/utils";

/**
 * Live "signal" sparkline for the hero status panel — a gradient telemetry line
 * that scrolls left forever. The motion is a single `translateX` transform
 * (GPU-composited, cheap, and auto-gated by the reduce-motion rules); the path
 * itself is deterministic so there's no hydration mismatch.
 *
 * One period (18 samples) is tiled twice and the strip translates by exactly one
 * period (−PERIOD px), so the loop is seamless.
 */
const SAMPLES = [20, 18, 22, 8, 32, 16, 22, 18, 30, 12, 24, 16, 20, 10, 28, 18, 24, 16];
const STEP = 20; // px between samples
const PERIOD = SAMPLES.length * STEP; // 360
const HEIGHT = 40;

// two periods + 1 closing point so the seam matches (point at x=PERIOD == x=0)
const points = Array.from({ length: SAMPLES.length * 2 + 1 }, (_, i) => SAMPLES[i % SAMPLES.length]);
const PATH = points.reduce((d, y, i) => d + (i === 0 ? `M0 ${y}` : ` L${i * STEP} ${y}`), "");

export function SignalWave({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("relative h-10 overflow-hidden", className)}
      style={{
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
        maskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
      }}
    >
      {/* baseline */}
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border-subtle/60" />
      <svg
        width={PERIOD * 2}
        height={HEIGHT}
        viewBox={`0 0 ${PERIOD * 2} ${HEIGHT}`}
        className="signal-wave block h-10"
        style={{ width: PERIOD * 2 }}
      >
        <defs>
          <linearGradient id="signalwave-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" style={{ stopColor: "var(--accent)" }} />
            <stop offset="55%" style={{ stopColor: "var(--accent-2)" }} />
            <stop offset="100%" style={{ stopColor: "var(--accent)" }} />
          </linearGradient>
        </defs>
        <path
          d={PATH}
          fill="none"
          stroke="url(#signalwave-grad)"
          strokeWidth={2.25}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
