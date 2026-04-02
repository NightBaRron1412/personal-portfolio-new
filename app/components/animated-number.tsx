"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { useMotionPreference } from "../motion-provider";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedNumber({ value, duration = 0.9, className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const { hydrated, motionEnabled } = useMotionPreference();
  const enableMotion = hydrated && motionEnabled;
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);

  useEffect(() => {
    if (!enableMotion || !inView) return;

    const controls = animate(displayRef.current, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        const rounded = Math.round(latest);
        displayRef.current = rounded;
        setDisplay(rounded);
      },
    });

    return () => controls.stop();
  }, [duration, enableMotion, inView, value]);

  return (
    <span ref={ref} className={className}>
      {(!enableMotion ? value : display).toLocaleString("en-US")}
    </span>
  );
}
