"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------
   Animated 404 page with floating particles + glitch text
   ------------------------------------------------------------------ */
export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [glitch, setGlitch] = useState(false);

  // Floating particles background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: {
      x: number;
      y: number;
      r: number;
      dx: number;
      dy: number;
      o: number;
      color: string;
    }[] = [];

    const colors = ["#6c0c9c", "#31708e", "#b42484", "#4f46e5"];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        o: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(108, 12, 156, ${0.08 * (1 - d / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.o;
        ctx.fill();
        ctx.globalAlpha = 1;

        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Periodic glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg-main">
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />

      {/* Gradient orbs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent-purple/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent-blue/20 blur-[120px]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Glitchy 404 */}
        <div className="relative select-none">
          <h1
            className={`text-[10rem] font-black leading-none tracking-tighter sm:text-[14rem] ${
              glitch ? "animate-glitch" : ""
            }`}
            style={{
              background:
                "linear-gradient(135deg, var(--accent-purple), var(--accent-pink), var(--accent-blue))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </h1>

          {/* Glitch layers */}
          {glitch && (
            <>
              <span
                className="absolute inset-0 text-[10rem] font-black leading-none tracking-tighter sm:text-[14rem]"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  clipPath: "inset(20% 0 40% 0)",
                  transform: "translate(-4px, 2px)",
                }}
                aria-hidden
              >
                404
              </span>
              <span
                className="absolute inset-0 text-[10rem] font-black leading-none tracking-tighter sm:text-[14rem]"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent-pink), var(--accent-blue))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  clipPath: "inset(60% 0 5% 0)",
                  transform: "translate(4px, -2px)",
                }}
                aria-hidden
              >
                404
              </span>
            </>
          )}
        </div>

        {/* Subtitle with typing cursor */}
        <p className="mt-2 text-lg font-medium text-text-secondary sm:text-xl">
          This page has drifted into the void
        </p>

        {/* Animated line */}
        <div className="relative mt-6 h-px w-48 overflow-hidden rounded-full bg-border-subtle">
          <div className="animate-shimmer absolute inset-0 h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-accent-purple to-transparent" />
        </div>

        {/* Description */}
        <p className="mt-6 max-w-md text-sm leading-relaxed text-text-secondary">
          The page you&apos;re looking for doesn&apos;t exist, has been moved, or
          is temporarily unavailable.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-accent-purple px-6 py-3 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition group-hover:opacity-100" />
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
            </svg>
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-elevated px-6 py-3 text-sm font-medium text-text-primary transition-all hover:-translate-y-0.5 hover:border-accent-blue/40"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
