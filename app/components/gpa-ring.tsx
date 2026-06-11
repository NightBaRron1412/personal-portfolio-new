"use client";

import { useEffect, useId, useRef, useState } from "react";

const fmt = (n: number) => String(Number(n.toFixed(2)));

/**
 * Radial GPA gauge. Replaces the old inline GPA pill — which, being
 * `inline-flex`, flowed onto the school-name line and crowded it. The arc
 * fills to value/max with the brand gradient when scrolled into view; under
 * reduced motion the `!important` transition override snaps it to final.
 */
export function GpaRing({
  value,
  max,
  size = 66,
  stroke = 5,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const fraction = Math.max(0, Math.min(1, value / max));
  const gid = useId().replace(/:/g, "");
  const ref = useRef<SVGSVGElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const offset = shown ? circumference * (1 - fraction) : circumference;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      title={`GPA ${fmt(value)} / ${fmt(max)}`}
    >
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        role="img"
        aria-label={`GPA ${fmt(value)} out of ${fmt(max)}`}
      >
        <defs>
          <linearGradient id={`gpa-${gid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "var(--accent)" }} />
            <stop offset="100%" style={{ stopColor: "var(--accent-2)" }} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#gpa-${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="num text-base font-semibold leading-none text-text-primary">
          {fmt(value)}
        </span>
        <span className="num mt-[3px] text-[9px] leading-none text-text-faint">
          / {fmt(max)}
        </span>
      </div>
    </div>
  );
}
