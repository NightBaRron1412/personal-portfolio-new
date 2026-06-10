"use client";

import { useEffect, useRef } from "react";

/**
 * Telemetry crosshair cursor — full-viewport reticle that tracks the pointer
 * with a live X/Y readout and "locks" (grows + switches to the violet accent)
 * when hovering interactive elements. Desktop/hover only; pointer-events-none.
 * Tracking is instant (no easing), so it's fine under reduced-motion.
 */
export function CrosshairCursor() {
  const vRef = useRef<HTMLDivElement>(null);
  const hRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;

    const root = document.documentElement;
    let raf = 0;
    let x = -200;
    let y = -200;
    let shown = false;
    let locked = false;

    const render = () => {
      raf = 0;
      if (vRef.current) vRef.current.style.transform = `translateX(${x}px)`;
      if (hRef.current) hRef.current.style.transform = `translateY(${y}px)`;
      if (dotRef.current)
        dotRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      if (tagRef.current) {
        tagRef.current.style.transform = `translate(${x}px, ${y}px)`;
        tagRef.current.textContent = locked
          ? "● LOCK"
          : `X ${Math.round(x)}  Y ${Math.round(y)}`;
      }
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const target = e.target as Element | null;
      const over = !!target?.closest?.(
        'a, button, input, textarea, select, summary, [role="button"], [tabindex]'
      );
      if (over !== locked) {
        locked = over;
        root.classList.toggle("cursor-locked", locked);
      }
      if (!shown) {
        shown = true;
        root.classList.add("cursor-active");
      }
      if (!raf) raf = requestAnimationFrame(render);
    };

    const hide = () => {
      shown = false;
      root.classList.remove("cursor-active");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      if (raf) cancelAnimationFrame(raf);
      root.classList.remove("cursor-active", "cursor-locked");
    };
  }, []);

  return (
    <div aria-hidden className="crosshair pointer-events-none fixed inset-0 z-[60]">
      <div ref={vRef} className="crosshair-line absolute left-0 top-0 h-full w-px" />
      <div ref={hRef} className="crosshair-line absolute left-0 top-0 h-px w-full" />
      <div ref={dotRef} className="crosshair-reticle absolute left-0 top-0" />
      <div ref={tagRef} className="crosshair-tag absolute left-0 top-0" />
    </div>
  );
}
