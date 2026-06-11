"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { prefersReducedMotion, onMotionPreferenceChange } from "@/lib/motion";

/**
 * InstrumentField — a cursor-reactive constellation of "datasheet pixels".
 *
 * A sparse grid of small squares drifts gently and links into a faint network;
 * a cursor sweep brightens nearby nodes, pulls them slightly toward the pointer,
 * and draws violet sightlines + a scan ring. Fits the telemetry/instrument
 * design language and makes the whole page feel alive under the cursor.
 *
 * Performance: fixed to the viewport (node count bounded by screen area, capped),
 * DPR-capped, O(n) node draw with bounded neighbor links, paused while the tab is
 * hidden, and rendered as a single static frame under prefers-reduced-motion.
 * pointer-events-none so it never intercepts interaction.
 */
// Brand colors; lower alpha in light mode so it stays a whisper on white.
function palette(light: boolean) {
  return {
    teal: light ? "13,148,136" : "45,212,191",
    violet: light ? "124,58,237" : "167,139,250",
    nodeA: light ? 0.5 : 0.55,
    linkA: light ? 0.13 : 0.16,
    cursorA: light ? 0.5 : 0.6,
  };
}

export function InstrumentField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();
  // Palette lives in a ref so a theme switch just swaps colors on the next frame
  // — it does NOT tear down and rebuild the canvas (which contributed to jank).
  const paletteRef = useRef(palette(resolvedTheme === "light"));
  useEffect(() => {
    paletteRef.current = palette(resolvedTheme === "light");
  }, [resolvedTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const TARGET_NODES = 230; // keeps node count (and O(n^2) links) bounded at any size
    const BASE_SPACING = 92;
    let spacing = BASE_SPACING; // px between nodes — grows on big screens
    let LINK = 118; // max node-to-node link distance (scales with spacing)
    let REACH = 168; // cursor influence radius (scales with spacing)

    type Node = { bx: number; by: number; x: number; y: number; ph: number; amp: number };
    let nodes: Node[] = [];
    let w = 0;
    let h = 0;
    let scrollBoost = 0; // links brighten with scroll velocity, then decay
    let lastScrollY = window.scrollY;

    const build = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Adaptive spacing: spread ~TARGET_NODES across the WHOLE viewport so the
      // field fills large monitors too (instead of capping to the top rows).
      spacing = Math.max(BASE_SPACING, Math.sqrt((w * h) / TARGET_NODES));
      LINK = spacing + 24;
      REACH = Math.max(168, spacing * 1.7);

      const cols = Math.ceil(w / spacing) + 1;
      const rows = Math.ceil(h / spacing) + 1;
      nodes = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // deterministic per-cell jitter
          const j = Math.sin((c * 12.9898 + r * 78.233) * 43758.5453);
          const jx = (j - Math.floor(j) - 0.5) * spacing * 0.6;
          const k = Math.sin((c * 39.346 + r * 11.135) * 24634.6345);
          const jy = (k - Math.floor(k) - 0.5) * spacing * 0.6;
          nodes.push({
            bx: c * spacing + jx,
            by: r * spacing + jy,
            x: 0,
            y: 0,
            ph: (j - Math.floor(j)) * Math.PI * 2,
            amp: 4 + (k - Math.floor(k)) * 6,
          });
        }
      }
    };

    const mouse = { x: -9999, y: -9999, on: false };
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.on = true;
    };
    const onLeave = () => {
      mouse.on = false;
    };

    const drawFrame = (time: number) => {
      const { teal, violet, nodeA, linkA, cursorA } = paletteRef.current;
      ctx.clearRect(0, 0, w, h);
      scrollBoost *= 0.9; // decay the scroll-velocity glow each frame

      // update positions (gentle drift)
      for (const n of nodes) {
        n.x = n.bx + Math.sin(time * 0.0004 + n.ph) * n.amp;
        n.y = n.by + Math.cos(time * 0.00035 + n.ph) * n.amp;
      }

      // pull + brighten near the cursor
      if (mouse.on) {
        for (const n of nodes) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < REACH * REACH) {
            const f = (1 - Math.sqrt(d2) / REACH) * 0.18;
            n.x += dx * f;
            n.y += dy * f;
          }
        }
      }

      // node-to-node links
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]!;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            const d = Math.sqrt(d2);
            const alpha = Math.min(0.6, (1 - d / LINK) * linkA * (1 + scrollBoost * 2));
            ctx.strokeStyle = `rgba(${teal},${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // cursor sightlines + scan ring
      if (mouse.on) {
        for (const n of nodes) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < REACH * REACH) {
            const d = Math.sqrt(d2);
            ctx.strokeStyle = `rgba(${violet},${(1 - d / REACH) * cursorA})`;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(n.x, n.y);
            ctx.stroke();
          }
        }
        ctx.strokeStyle = `rgba(${violet},${cursorA * 0.5})`;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // nodes (datasheet pixels — small squares), brighter near cursor
      for (const n of nodes) {
        let a = nodeA;
        let s = 2;
        if (mouse.on) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < REACH * REACH) {
            const t = 1 - Math.sqrt(d2) / REACH;
            a = Math.min(1, nodeA + t * 0.45);
            s = 2 + t * 1.6;
          }
        }
        ctx.fillStyle = `rgba(${teal},${a})`;
        ctx.fillRect(n.x - s / 2, n.y - s / 2, s, s);
      }
    };

    build();

    let raf = 0;
    const loop = (t: number) => {
      drawFrame(t);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    // Live motion preference — pauses to a single static frame when the visitor
    // turns motion off (in-app toggle or OS), resumes when turned back on.
    let reduced = prefersReducedMotion();
    const applyMotion = () => {
      reduced = prefersReducedMotion();
      if (reduced) {
        stop();
        drawFrame(0);
      } else if (!document.hidden) {
        start();
      }
    };

    const onResize = () => {
      build();
      if (reduced) drawFrame(0);
    };
    const onScroll = () => {
      const yy = window.scrollY;
      scrollBoost = Math.min(1.5, scrollBoost + Math.abs(yy - lastScrollY) * 0.012);
      lastScrollY = yy;
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    const onVisibility = () => {
      if (reduced) return;
      document.hidden ? stop() : start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const unsubscribe = onMotionPreferenceChange(applyMotion);

    applyMotion();

    return () => {
      stop();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      unsubscribe();
    };
    // Set up once; theme is read live from paletteRef (no rebuild on toggle).
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className ?? "pointer-events-none fixed inset-0 z-0"}
    />
  );
}
