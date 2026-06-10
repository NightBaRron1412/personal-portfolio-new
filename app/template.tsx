"use client";

import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useMotionPreference } from "./motion-provider";

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { hydrated, motionEnabled } = useMotionPreference();
  const enableMotion = hydrated && motionEnabled;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        // Key on pathname ONLY — including the motion flag caused a full page
        // remount the moment hydration flipped it (the "double refresh").
        key={pathname}
        initial={enableMotion ? { opacity: 0 } : false}
        animate={enableMotion ? { opacity: 1 } : {}}
        exit={enableMotion ? { opacity: 0 } : {}}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
