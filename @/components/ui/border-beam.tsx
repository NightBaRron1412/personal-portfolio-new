"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * A light that continuously travels around an element's border. Adapted from the
 * Magic UI "border-beam" (21st.dev) to Tailwind v3 + framer-motion + theme
 * accents. Drop inside a `position: relative` element with a border-radius.
 */
export function BorderBeam({
  className,
  size = 64,
  duration = 7,
  delay = 0,
  colorFrom = "var(--accent)",
  colorTo = "var(--accent-2)",
  borderWidth = 1.5,
  reverse = false,
}: {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  borderWidth?: number;
  reverse?: boolean;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
      style={{
        border: `${borderWidth}px solid transparent`,
        WebkitMask:
          "linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
      }}
    >
      <motion.div
        className={cn(
          "absolute aspect-square bg-gradient-to-l from-[var(--beam-from)] via-[var(--beam-to)] to-transparent",
          className
        )}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            "--beam-from": colorFrom,
            "--beam-to": colorTo,
          } as React.CSSProperties
        }
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: reverse ? ["100%", "0%"] : ["0%", "100%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration, delay: -delay }}
      />
    </div>
  );
}
