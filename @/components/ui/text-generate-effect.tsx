"use client";

import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Adapted from the Aceternity "Text Generate Effect" (featured on 21st.dev) —
 * retargeted to framer-motion and made color-inheriting so it fits any theme.
 * Pass `segments` to keep inline accent highlights.
 */
export function TextGenerateEffect({
  segments,
  className,
  filter = true,
  duration = 0.5,
}: {
  segments: { text: string; accent?: boolean }[];
  className?: string;
  filter?: boolean;
  duration?: number;
}) {
  const [scope, animate] = useAnimate();

  // flatten into words while remembering accent state
  const words = segments.flatMap((seg) =>
    seg.text.split(" ").filter(Boolean).map((w) => ({ word: w, accent: seg.accent }))
  );

  useEffect(() => {
    animate(
      "span",
      { opacity: 1, filter: filter ? "blur(0px)" : "none" },
      { duration, delay: stagger(0.04) }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope.current]);

  return (
    <motion.div ref={scope} className={cn(className)}>
      {words.map((w, idx) => (
        <motion.span
          key={`${w.word}-${idx}`}
          className={cn("inline-block opacity-0", w.accent && "text-accent")}
          style={{ filter: filter ? "blur(8px)" : "none" }}
        >
          {w.word}
          {idx < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.div>
  );
}
