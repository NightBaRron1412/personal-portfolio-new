"use client";

import { PointerEvent, PropsWithChildren, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMotionPreference } from "../motion-provider";

interface MagneticProps extends PropsWithChildren {
  className?: string;
  strength?: number;
}

export function Magnetic({ children, className, strength = 0.18 }: MagneticProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { hydrated, motionEnabled } = useMotionPreference();
  const enableMotion = hydrated && motionEnabled;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 320, damping: 24, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 320, damping: 24, mass: 0.4 });

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!enableMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = event.clientX - rect.left - rect.width / 2;
    const relY = event.clientY - rect.top - rect.height / 2;
    x.set(relX * strength);
    y.set(relY * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  if (!enableMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      {children}
    </motion.div>
  );
}
