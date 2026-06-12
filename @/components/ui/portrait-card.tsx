"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * 3D-tilt portrait, reframed as a live "instrument readout" so it has presence
 * even in a still: a slowly rotating conic-gradient ring (.portrait-ring), a
 * vertical scan sweep, faint CRT scanlines, HUD corner brackets, and a LIVE /
 * coordinates telemetry strip. Tilt-on-hover + Ken-Burns drift add the motion.
 * All animation is auto-gated by the global reduced-motion rules.
 *
 * Adapted from the 21st.dev "@kavikatiyar/3d-card" tilt base.
 */
export function PortraitCard({
  imageUrl,
  name,
  subtitle,
  coords = "43.65°N",
  className,
}: {
  imageUrl: string;
  name: string;
  subtitle: string;
  coords?: string;
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

  // HUD corner brackets — placed in JSX (the card's ::before is the conic ring).
  const corners = [
    "left-2 top-2 border-l-2 border-t-2",
    "right-2 top-2 border-r-2 border-t-2",
    "left-2 bottom-2 border-l-2 border-b-2",
    "right-2 bottom-2 border-r-2 border-b-2",
  ];

  return (
    <div className={cn("[perspective:1000px]", className)}>
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="portrait-ring panel group/portrait relative aspect-[4/5] w-full rounded-2xl"
      >
        <div
          style={{ transform: "translateZ(45px)", transformStyle: "preserve-3d" }}
          className="absolute inset-3 overflow-hidden rounded-xl"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={name}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="ken-burns absolute inset-0 h-full w-full object-cover"
          />

          {/* legibility gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/15" />

          {/* faint CRT scanlines */}
          <div className="portrait-lines pointer-events-none absolute inset-0 opacity-60" aria-hidden />

          {/* vertical scan sweep */}
          <div
            aria-hidden
            className="portrait-scan pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-transparent via-accent/30 to-transparent"
          />

          {/* top telemetry strip */}
          <div
            style={{ transform: "translateZ(40px)" }}
            className="absolute inset-x-0 top-0 flex items-center justify-between p-3"
          >
            <span className="mono inline-flex items-center gap-1.5 rounded bg-black/45 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-white/85 backdrop-blur-sm">
              <span className="pulse-dot relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              LIVE
            </span>
            <span className="mono rounded bg-black/45 px-1.5 py-0.5 text-[10px] tracking-wide text-white/65 backdrop-blur-sm">
              {coords}
            </span>
          </div>

          {/* bottom caption */}
          <div
            style={{ transform: "translateZ(38px)" }}
            className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4"
          >
            <span className="font-display text-base font-semibold text-white">{name}</span>
            <span className="mono text-xs text-white/70">{subtitle}</span>
          </div>
        </div>

        {/* HUD corner brackets — float above the frame for depth */}
        {corners.map((c) => (
          <span
            key={c}
            aria-hidden
            style={{ transform: "translateZ(55px)" }}
            className={cn(
              "pointer-events-none absolute h-4 w-4 rounded-[2px] border-accent/70",
              "opacity-70 transition-opacity duration-300 group-hover/portrait:opacity-100",
              c
            )}
          />
        ))}
      </motion.div>
    </div>
  );
}
