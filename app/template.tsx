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
        key={`${pathname}-${enableMotion ? "m" : "s"}`}
        initial={
          !enableMotion
            ? false
            : { opacity: 0, y: 8, filter: "blur(4px)" }
        }
        animate={
          !enableMotion
            ? {}
            : { opacity: 1, y: 0, filter: "blur(0px)" }
        }
        exit={
          !enableMotion
            ? {}
            : { opacity: 0, y: -6, filter: "blur(3px)" }
        }
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
