"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion, onMotionPreferenceChange } from "@/lib/motion";

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
  const frame = useRef(0);
  useEffect(() => {
    const reset = () => {
      cancelAnimationFrame(frame.current);
      if (ref.current) ref.current.style.transform = "none";
    };
    const unsubscribe = onMotionPreferenceChange(reset);
    return () => { reset(); unsubscribe(); };
  }, []);

  const motionOff = () =>
    typeof window !== "undefined" &&
    (window.matchMedia("(hover: none)").matches ||
      prefersReducedMotion());

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || motionOff()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--spot-x", `${x}px`);
      el.style.setProperty("--spot-y", `${y}px`);
      el.style.transform = `perspective(1000px) rotateX(${-(py - 0.5) * 2 * max}deg) rotateY(${(px - 0.5) * 2 * max}deg)`;
    });
  };

  const onLeave = () => {
    cancelAnimationFrame(frame.current);
    if (ref.current) ref.current.style.transform = "none";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "group/tilt relative transition-transform duration-200 ease-out",
        className
      )}
    >
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[14px] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
        style={{
          background: "radial-gradient(420px circle at var(--spot-x, -300px) var(--spot-y, -300px), var(--accent-soft), transparent 60%)",
        }}
      />
    </div>
  );
}
