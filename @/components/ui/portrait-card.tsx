"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * 3D-tilt portrait card — adapted from the 21st.dev "@kavikatiyar/3d-card".
 * Responsive, theme-token border, depth layers that float on hover, plus a slow
 * Ken-Burns zoom so it has life at rest. No links — just a name caption.
 */
export function PortraitCard({
  imageUrl,
  name,
  subtitle,
  className,
}: {
  imageUrl: string;
  name: string;
  subtitle: string;
  className?: string;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spring = { damping: 18, stiffness: 150 };
  const sx = useSpring(mouseX, spring);
  const sy = useSpring(mouseY, spring);
  const rotateX = useTransform(sy, [-0.5, 0.5], ["9deg", "-9deg"]);
  const rotateY = useTransform(sx, [-0.5, 0.5], ["-9deg", "9deg"]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width - 0.5);
    mouseY.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className={cn("[perspective:1000px]", className)}>
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="panel ticks group/portrait relative aspect-[4/5] w-full rounded-2xl"
      >
        <div
          style={{ transform: "translateZ(45px)", transformStyle: "preserve-3d" }}
          className="absolute inset-3 overflow-hidden rounded-xl"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            className="ken-burns absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />
          <div
            style={{ transform: "translateZ(38px)" }}
            className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4"
          >
            <span className="font-display text-base font-semibold text-white">{name}</span>
            <span className="mono text-xs text-white/70">{subtitle}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
