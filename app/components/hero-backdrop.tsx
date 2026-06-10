"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ShaderBackground } from "@/components/ui/shader-background";

const MASK = "linear-gradient(to bottom, #000 0%, #000 42%, transparent 88%)";

/**
 * Hero shader band with scroll parallax — the plasma drifts down slower than the
 * page so the hero gains depth. Masked so it dissolves into the page (no seam);
 * a left scrim keeps hero text legible. Contains no fixed descendants, so the
 * transform here is safe (won't create a containing block for fixed elements).
 */
export function HeroBackdrop() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 900], [0, 150]);

  return (
    <motion.div
      aria-hidden
      style={{ y, maskImage: MASK, WebkitMaskImage: MASK }}
      className="hero-shader absolute inset-x-0 top-0 z-0 h-[115vh] overflow-hidden"
    >
      <ShaderBackground className="h-full w-full opacity-50" />
      {/* darken the left (text) side, keep the shader vivid on the right */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-bg-main via-bg-main/85 to-transparent" />
      {/* gentle overall floor for small/secondary text */}
      <div className="pointer-events-none absolute inset-0 bg-bg-main/25" />
    </motion.div>
  );
}
