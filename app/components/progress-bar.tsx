"use client";

import { motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function ProgressBar() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] origin-left bg-gradient-to-r from-accent-blue via-accent-pink to-accent-purple"
      style={{ scaleX: scrollYProgress }}
      aria-hidden
    />,
    document.body
  );
}
