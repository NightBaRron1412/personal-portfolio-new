"use client";

import { useEffect, useRef, useState } from "react";
import createGlobe, { type COBEOptions } from "cobe";
import { useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const DAMP = 1400;

const MARKERS: COBEOptions["markers"] = [
  { location: [43.6532, -79.3832], size: 0.12 }, // Toronto (now)
  { location: [49.2827, -123.1207], size: 0.07 }, // Vancouver (Huawei R&D)
  { location: [44.2312, -76.486], size: 0.06 }, // Kingston (Queen's)
  { location: [30.0444, 31.2357], size: 0.09 }, // Cairo
  { location: [31.0409, 31.3785], size: 0.07 }, // Mansoura
  { location: [22.5431, 114.0579], size: 0.06 }, // Shenzhen
  { location: [36.8065, 10.1815], size: 0.05 }, // Tunis
  { location: [51.5074, -0.1278], size: 0.05 }, // London
];

/**
 * Interactive globe (cobe v2) — adapted from the Magic UI globe (21st.dev),
 * theme-aware (light globe in light mode, dark globe in dark mode), teal markers.
 */
export function Globe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0);
  const pointerInteracting = useRef<number | null>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const r = useMotionValue(0);
  const rs = useSpring(r, { mass: 1, damping: 30, stiffness: 100 });

  const updateInteraction = (value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab";
  };
  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      r.set(r.get() + delta / DAMP);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mounted) return;

    const light = resolvedTheme === "light";
    let width = 0;
    const onResize = () => {
      width = canvas.offsetWidth;
    };
    window.addEventListener("resize", onResize);
    onResize();

    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      document.documentElement.getAttribute("data-force-motion") !== "true";

    let globe: ReturnType<typeof createGlobe> | null = null;
    let raf = 0;
    let inView = false;

    const startRaf = () => {
      if (raf || !globe) return;
      const tick = () => {
        if (!reduced && pointerInteracting.current === null) phiRef.current += 0.004;
        globe!.update({ phi: phiRef.current + rs.get(), width: width * 2, height: width * 2 });
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const stopRaf = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    // Build the (heavy) globe only the first time it scrolls into view — it
    // lives at the bottom of the page, so this keeps it off the initial load.
    const init = () => {
      if (globe) return;
      onResize();
      globe = createGlobe(canvas, {
        width: width * 2,
        height: width * 2,
        devicePixelRatio: 2,
        phi: 0,
        theta: 0.3,
        mapSamples: 16000,
        dark: light ? 0 : 1,
        diffuse: light ? 0.5 : 1.1,
        mapBrightness: light ? 5.5 : 5,
        baseColor: light ? [0.92, 0.94, 0.97] : [0.26, 0.3, 0.34],
        markerColor: light ? [13 / 255, 148 / 255, 136 / 255] : [45 / 255, 212 / 255, 191 / 255],
        glowColor: light ? [1, 1, 1] : [0.13, 0.2, 0.22],
        markers: MARKERS,
      });
      requestAnimationFrame(() => {
        canvas.style.opacity = "1";
      });
    };

    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (inView) {
        init();
        if (!document.hidden) startRaf();
      } else {
        stopRaf();
      }
    });
    io.observe(canvas);

    const onVisibility = () => (document.hidden || !inView ? stopRaf() : startRaf());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stopRaf();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      globe?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme, mounted]);

  return (
    <div className={cn("aspect-square w-full", className)}>
      <canvas
        ref={canvasRef}
        className="size-full opacity-0 transition-opacity duration-700"
        onPointerDown={(e) => updateInteraction(e.clientX)}
        onPointerUp={() => updateInteraction(null)}
        onPointerOut={() => updateInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) => e.touches[0] && updateMovement(e.touches[0].clientX)}
      />
    </div>
  );
}
