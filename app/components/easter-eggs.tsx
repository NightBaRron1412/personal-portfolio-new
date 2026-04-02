"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMotionPreference } from "../motion-provider";

/* ── Konami Code sequence ─────────────────────────────────────────────────── */
const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

/* ── Matrix Rain Canvas ───────────────────────────────────────────────────── */
function MatrixRain({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";
    const fontSize = 14;
    const cols = Math.floor(w / fontSize);
    const drops: number[] = Array(cols).fill(0).map(() => Math.random() * -50);

    let opacity = 0;
    let fadeOut = false;
    let raf: number;

    const timer = setTimeout(() => { fadeOut = true; }, 4000);

    const draw = () => {
      if (fadeOut) {
        opacity -= 0.02;
        if (opacity <= 0) {
          onDone();
          return;
        }
      } else {
        opacity = Math.min(opacity + 0.05, 0.92);
      }

      ctx.fillStyle = `rgba(0, 0, 0, ${fadeOut ? 0.15 : 0.05})`;
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        const brightness = Math.random() > 0.95 ? 255 : 100 + Math.random() * 80;
        ctx.fillStyle = `rgba(0, ${brightness}, 65, ${opacity})`;
        ctx.fillText(char, x, y);

        if (y > h && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.6 + Math.random() * 0.6;
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener("resize", resize);
    };
  }, [onDone]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[10000] pointer-events-none"
      aria-hidden
    />
  );
}

/* ── Main Easter Eggs Component ───────────────────────────────────────────── */

interface EasterEggsProps {
  onPartyMode?: () => void;
}

export function EasterEggs({ onPartyMode }: EasterEggsProps) {
  const { hydrated, motionEnabled } = useMotionPreference();
  const [matrixActive, setMatrixActive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const konamiIndexRef = useRef(0);

  useEffect(() => { setMounted(true); }, []);

  const handleMatrixDone = useCallback(() => {
    setMatrixActive(false);
  }, []);

  useEffect(() => {
    if (!hydrated || !motionEnabled) return;

    const handleKey = (e: KeyboardEvent) => {
      // Konami code
      const expected = KONAMI[konamiIndexRef.current];
      if (e.key.toLowerCase() === expected.toLowerCase()) {
        konamiIndexRef.current++;
        if (konamiIndexRef.current >= KONAMI.length) {
          konamiIndexRef.current = 0;
          setMatrixActive(true);
        }
      } else {
        konamiIndexRef.current = 0;
        if (e.key.toLowerCase() === KONAMI[0].toLowerCase()) {
          konamiIndexRef.current = 1;
        }
      }

      // Party mode: Ctrl+Shift+P
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        onPartyMode?.();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [hydrated, motionEnabled, onPartyMode]);

  // Portrait spin easter egg
  useEffect(() => {
    if (!hydrated || !motionEnabled) return;

    let clickCount = 0;
    let resetTimer: ReturnType<typeof setTimeout>;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const portrait = target.closest("[data-portrait]");
      if (!portrait) return;

      clickCount++;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { clickCount = 0; }, 1500);

      if (clickCount >= 7) {
        clickCount = 0;
        const img = portrait.querySelector("img") || portrait;
        (img as HTMLElement).style.transition = "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)";
        (img as HTMLElement).style.transform = "rotate(360deg) scale(1.1)";
        setTimeout(() => {
          (img as HTMLElement).style.transform = "";
        }, 900);
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      clearTimeout(resetTimer);
    };
  }, [hydrated, motionEnabled]);

  if (!mounted) return null;

  return (
    <>
      {matrixActive && createPortal(
        <MatrixRain onDone={handleMatrixDone} />,
        document.body
      )}
    </>
  );
}
