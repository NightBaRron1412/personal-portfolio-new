"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Animated "shiny" button — adapted from the Magic UI shiny-button (21st.dev) to
 * framer-motion + the theme gradient. A diagonal highlight sweeps across on a
 * loop; the sweep is driven by an animated `--x` CSS variable.
 */
const animationProps = {
  initial: { "--x": "100%" },
  animate: { "--x": "-100%" },
  whileTap: { scale: 0.96 },
  transition: {
    repeat: Infinity,
    repeatType: "loop" as const,
    repeatDelay: 1.2,
    type: "spring" as const,
    stiffness: 18,
    damping: 15,
    mass: 2,
  },
} satisfies HTMLMotionProps<"button">;

type ShinyButtonProps = Omit<HTMLMotionProps<"button">, "ref" | "children"> & {
  children?: React.ReactNode;
};

export const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        {...animationProps}
        {...props}
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden rounded-xl px-5 text-sm font-semibold text-text-on-accent shadow-glow transition-transform",
          className
        )}
        style={{ background: "var(--gradient)", ...props.style }}
      >
        <span className="relative z-10">{children}</span>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage:
              "linear-gradient(-75deg, transparent calc(var(--x) + 18%), rgba(255,255,255,0.6) calc(var(--x) + 28%), transparent calc(var(--x) + 38%))",
          }}
        />
      </motion.button>
    );
  }
);

ShinyButton.displayName = "ShinyButton";
