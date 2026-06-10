"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Sweep — a thin gradient rule that draws left→right (scaleX) when it scrolls
 * into view, for a "readout settling" flourish under metrics. Reduced-motion
 * safe (renders fully drawn). Decorative (aria-hidden).
 */
export function Sweep({ className, delay = 0 }: { className?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      document.documentElement.getAttribute("data-force-motion") !== "true";
    if (reduced) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden
      className={cn(
        "block h-px origin-left transition-transform duration-700 ease-out",
        className
      )}
      style={{
        background: "var(--gradient)",
        transform: on ? "scaleX(1)" : "scaleX(0)",
        transitionDelay: `${delay}ms`,
      }}
    />
  );
}
