"use client";

import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Cursor-spotlight + subtle 3D tilt card (the 21st.dev "3d-card" / "card-spotlight"
 * idea, implemented lightweight — no three.js). Honors reduced-motion / touch.
 */
export function TiltSpotlight({
  children,
  className,
  max = 5,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [spot, setSpot] = useState({ x: -300, y: -300, on: false });

  const motionOff = () =>
    typeof window !== "undefined" &&
    (window.matchMedia("(hover: none)").matches ||
      (window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
        document.documentElement.getAttribute("data-force-motion") !== "true"));

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setSpot({ x: e.clientX - r.left, y: e.clientY - r.top, on: true });
    if (motionOff()) return;
    setTilt({ ry: (px - 0.5) * 2 * max, rx: -(py - 0.5) * 2 * max });
  };

  const onLeave = () => {
    setTilt({ rx: 0, ry: 0 });
    setSpot((s) => ({ ...s, on: false }));
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "group/tilt relative transition-transform duration-200 ease-out will-change-transform",
        className
      )}
      style={{ transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
    >
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[14px] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
        style={{
          background: `radial-gradient(420px circle at ${spot.x}px ${spot.y}px, var(--accent-soft), transparent 60%)`,
        }}
      />
    </div>
  );
}
