"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface CursorGlowProps {
  enabled: boolean;
}

interface TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

export function CursorGlow({ enabled }: CursorGlowProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const glowRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<TrailParticle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 767px)");

    const update = () => {
      setShouldRender(enabled && !prefersReduced.matches && !mobileQuery.matches);
    };

    update();
    prefersReduced.addEventListener("change", update);
    mobileQuery.addEventListener("change", update);
    return () => {
      prefersReduced.removeEventListener("change", update);
      mobileQuery.removeEventListener("change", update);
    };
  }, [enabled]);

  // Original radial gradient glow (CSS, no canvas)
  useEffect(() => {
    if (!shouldRender) return;
    const handler = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.background =
          `radial-gradient(240px at ${e.clientX}px ${e.clientY}px, var(--cursor-glow), transparent 60%)`;
      }
      prevMouseRef.current = { ...mouseRef.current };
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointermove", handler);
    return () => window.removeEventListener("pointermove", handler);
  }, [shouldRender]);

  // Particle trail (canvas, layered on top of the glow)
  useEffect(() => {
    if (!shouldRender) return;
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

    const onClick = (e: MouseEvent) => {
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const speed = 1.5 + Math.random() * 3;
        particlesRef.current.push({
          x: e.clientX, y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1, maxLife: 0.5 + Math.random() * 0.3,
          size: 1.2 + Math.random() * 1.5,
          hue: 280 + Math.random() * 80,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const dx = mx - prevMouseRef.current.x;
      const dy = my - prevMouseRef.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);

      // Spawn trail particles when moving
      if (speed > 1.5) {
        const count = Math.min(Math.max(1, Math.floor(speed * 0.2)), 4);
        for (let i = 0; i < count; i++) {
          particlesRef.current.push({
            x: mx + (Math.random() - 0.5) * 3,
            y: my + (Math.random() - 0.5) * 3,
            vx: (Math.random() - 0.5) * 1 - dx * 0.04,
            vy: (Math.random() - 0.5) * 1 - dy * 0.04,
            life: 1, maxLife: 0.35 + Math.random() * 0.25,
            size: 1 + Math.random() * 1.5,
            hue: 280 + Math.random() * 80,
          });
        }
      }

      const alive: TrailParticle[] = [];
      for (const p of particlesRef.current) {
        p.life -= 0.016 / p.maxLife;
        if (p.life <= 0) continue;

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.vy += 0.015;

        const alpha = p.life * 0.55;
        const size = p.size * p.life;

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 60%, 55%, ${alpha})`;
        ctx.fill();

        alive.push(p);
      }
      particlesRef.current = alive;

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener("click", onClick);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", resize);
    };
  }, [shouldRender]);

  if (typeof window === "undefined" || !shouldRender) return null;

  return createPortal(
    <>
      {/* Original soft radial glow */}
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 transition duration-300"
      />
      {/* Particle trail layer */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1]"
      />
    </>,
    document.body
  );
}
