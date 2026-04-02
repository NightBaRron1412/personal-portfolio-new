"use client";

import { motion, useAnimation, useInView } from "framer-motion";
import { PropsWithChildren, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useMotionPreference } from "../motion-provider";

interface SectionProps extends PropsWithChildren {
  className?: string;
  id?: string;
}

const hidden = { opacity: 0, y: 24, filter: "blur(8px)" };
const visible = { opacity: 1, y: 0, filter: "blur(0px)" };

export function Section({ children, className, id }: SectionProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const controls = useAnimation();
  const { hydrated, motionEnabled } = useMotionPreference();
  const enableMotion = hydrated && motionEnabled;

  useEffect(() => {
    if (!enableMotion) return;
    if (inView) {
      controls.start(visible);
    }
  }, [inView, enableMotion, controls]);

  return (
    <motion.section
      key={`${id ?? "section"}-${enableMotion ? "m" : "s"}`}
      id={id}
      ref={ref}
      className={cn("scroll-mt-32 py-16 sm:py-20 lg:py-24", className)}
      initial={enableMotion ? hidden : false}
      animate={enableMotion ? controls : undefined}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}
