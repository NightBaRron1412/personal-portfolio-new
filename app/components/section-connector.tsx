"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useMotionPreference } from "../motion-provider";

/* ── text sampler (renders big, scales to fit) ────────────────────────────── */

function sampleText(text: string, fitW: number, fitH: number): [number, number][] {
  const CW = 3000;
  const CH = 800;
  const off = document.createElement("canvas");
  off.width = CW;
  off.height = CH;
  const ctx = off.getContext("2d");
  if (!ctx) return [];

  const fontSize = 300;
  ctx.fillStyle = "#fff";
  ctx.font = `700 ${fontSize}px "Inter", system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, CW / 2, CH / 2);

  const data = ctx.getImageData(0, 0, CW, CH).data;
  let minX = CW, maxX = 0, minY = CH, maxY = 0;
  const step = 3;
  for (let y = 0; y < CH; y += step) {
    for (let x = 0; x < CW; x += step) {
      if (data[(y * CW + x) * 4 + 3] > 80) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX <= minX || maxY <= minY) return [];

  const rawPts: [number, number][] = [];
  const sampleStep = Math.max(2, Math.round(fontSize / 35));
  for (let y = minY; y <= maxY; y += sampleStep) {
    for (let x = minX; x <= maxX; x += sampleStep) {
      if (data[(y * CW + x) * 4 + 3] > 80) {
        rawPts.push([x - minX, y - minY]);
      }
    }
  }

  if (rawPts.length === 0) return [];

  // Scale by height, but clamp if it overflows width
  const textW = maxX - minX;
  const textH = maxY - minY;
  let scale = fitH / textH;
  if (textW * scale > fitW * 0.95) {
    scale = (fitW * 0.95) / textW;
  }
  const scaleX = scale;
  const scaleY = scale;
  const scaledW = textW * scale;

  const offsetX = (fitW - scaledW) / 2;
  const pts: [number, number][] = [];
  for (let i = 0; i < rawPts.length; i++) {
    const src = rawPts[i];
    pts.push([
      offsetX + src[0] * scaleX + (Math.random() - 0.5) * 1,
      src[1] * scaleY + (Math.random() - 0.5) * 1,
    ]);
  }
  return pts;
}

/* ── SVG icon paths ───────────────────────────────────────────────────────── */

const SECTION_ICONS: Record<string, string> = {
  // Person
  About: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  // CPU/processor chip
  Skills: "M6 6h12v12H6V6z M6 2v4 M10 2v4 M14 2v4 M18 2v4 M6 18v4 M10 18v4 M14 18v4 M18 18v4 M2 6h4 M2 10h4 M2 14h4 M2 18h4 M18 6h4 M18 10h4 M18 14h4 M18 18h4",
  // Code file with brackets
  Experience: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M10 12l-2 2 2 2 M14 12l2 2-2 2",
  // Rocket launch
  Projects: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0 M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5",
  // Git merge/pull request
  GitHub: "M18 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M6 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M6 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M6 7v10 M18 17V7a2 2 0 0 0-2-2h-5 M13 7l-2-2 2-2",
  // Graduation cap
  Education: "M22 10l-10-5L2 10l10 5 10-5z M6 12v5c0 0 2.5 3 6 3s6-3 6-3v-5",
  // Quote marks
  Testimonials: "M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25-1.5 3-3.75 3-.828 0-1 .494-1 1v1c0 1 0 1 1 1z",
  // Envelope
  Contact: "M2 4h20v16H2V4z M2 4l10 9L22 4",
};

function sampleSvgIcon(pathData: string, w: number, h: number, n: number): [number, number][] {
  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const ctx = off.getContext("2d");
  if (!ctx) return [];
  const iconSize = h * 0.88;
  const scale = iconSize / 24;
  const ox = (w - iconSize) / 2, oy = (h - iconSize) / 2;
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(scale, scale);
  const path = new Path2D(pathData);
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = "#fff";
  ctx.stroke(path);
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fill(path);
  ctx.restore();
  const data = ctx.getImageData(0, 0, w, h).data;
  const pts: [number, number][] = [];
  const step = Math.max(2, Math.round(iconSize / 30));
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (data[(y * w + x) * 4 + 3] > 30) pts.push([x, y]);
    }
  }
  const result: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const src = pts[i % pts.length] || [w / 2, h / 2];
    result.push([src[0] + (Math.random() - 0.5) * 1.5, src[1] + (Math.random() - 0.5) * 1.5]);
  }
  return result;
}

/* ── types ─────────────────────────────────────────────────────────────────── */

interface ConnectorGroup {
  label: string;
  centerY: number;
  dots: Dot[];
  textTargets: [number, number][];
  iconTargets: [number, number][];
  iconCoreCount: number;
  localFrame: number;
  seen: boolean;
}

interface Dot {
  x: number; y: number;
  tx: number; ty: number;
  homeX: number; homeY: number;
  vx: number; vy: number;
  phase: number;
  baseSize: number;
}

type RegisterFn = (id: string, label: string, el: HTMLDivElement) => void;
type UnregisterFn = (id: string) => void;

const ConnectorCtx = createContext<{ register: RegisterFn; unregister: UnregisterFn } | null>(null);

/* ── full-viewport canvas ─────────────────────────────────────────────────── */

export function ConnectorCanvas({ children }: { children: ReactNode }) {
  const { hydrated, motionEnabled } = useMotionPreference();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const groupsRef = useRef<Map<string, ConnectorGroup>>(new Map());
  const rafRef = useRef(0);
  const mouseRef = useRef({ x: -9999, y: -9999, clicked: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const buildGroup = useCallback((label: string, el: HTMLDivElement): ConnectorGroup => {
    const rect = el.getBoundingClientRect();
    const scrollY = window.scrollY;
    const cy = rect.top + scrollY + rect.height / 2;
    const vw = window.innerWidth;
    const isMobile = vw < 640;
    const slotH = isMobile ? 90 : 130;

    const textFitW = vw;
    const textFitH = slotH * 0.75;
    const textRaw = sampleText(label.toUpperCase(), textFitW, textFitH);
    const textTargets: [number, number][] = textRaw.map(([x, y]) => [x, cy - textFitH / 2 + y]);

    const count = textTargets.length;

    const iconPath = SECTION_ICONS[label] || SECTION_ICONS["About"];
    const iconSampleCount = Math.min(count, isMobile ? 400 : 600);
    const iconRaw = sampleSvgIcon(iconPath, vw, slotH, iconSampleCount);
    const iconCoreCount = iconRaw.length;
    const iconTargets: [number, number][] = [];
    const iconCx = vw / 2, iconCy = cy;
    for (let i = 0; i < count; i++) {
      if (i < iconRaw.length) {
        iconTargets.push([iconRaw[i][0], cy - slotH / 2 + iconRaw[i][1]]);
      } else {
        // Extras fly outward from icon center as they fade
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const dist = 120 + Math.random() * 200;
        iconTargets.push([iconCx + Math.cos(angle) * dist, iconCy + Math.sin(angle) * dist * 0.6]);
      }
    }

    const dots: Dot[] = [];
    for (let i = 0; i < count; i++) {
      // Start scattered so particles converge smoothly on first render
      const startX = textTargets[i][0] + (Math.random() - 0.5) * 150;
      const startY = textTargets[i][1] + (Math.random() - 0.5) * 80;
      dots.push({
        x: startX,
        y: startY,
        tx: textTargets[i][0],
        ty: textTargets[i][1],
        homeX: textTargets[i][0],
        homeY: textTargets[i][1],
        vx: 0, vy: 0,
        phase: Math.random() * Math.PI * 2,
        baseSize: isMobile ? (1.0 + Math.random() * 0.8) : (1.2 + Math.random() * 1.0),
      });
    }

    return { label, centerY: cy, dots, textTargets, iconTargets, iconCoreCount, localFrame: 0, seen: false };
  }, []);

  const elementsRef = useRef<Map<string, { label: string; el: HTMLDivElement }>>(new Map());

  const register: RegisterFn = useCallback((id, label, el) => {
    elementsRef.current.set(id, { label, el });
    groupsRef.current.set(id, buildGroup(label, el));
  }, [buildGroup]);

  const unregister: UnregisterFn = useCallback((id) => {
    elementsRef.current.delete(id);
    groupsRef.current.delete(id);
  }, []);

  const rebuildAll = useCallback(() => {
    for (const [id, { label, el }] of elementsRef.current.entries()) {
      const existing = groupsRef.current.get(id);
      const newGroup = buildGroup(label, el);
      if (existing && existing.dots.length >= newGroup.dots.length) {
        // Same or fewer points — just update targets in place
        for (let i = 0; i < newGroup.dots.length; i++) {
          existing.textTargets[i] = newGroup.textTargets[i];
          existing.iconTargets[i] = newGroup.iconTargets[i];
        }
        existing.centerY = newGroup.centerY;
        existing.iconCoreCount = newGroup.iconCoreCount;
      } else {
        // More points now (font loaded, better sampling) — fully replace
        // Copy positions from existing dots so there's no visual jump
        if (existing) {
          for (let i = 0; i < existing.dots.length && i < newGroup.dots.length; i++) {
            newGroup.dots[i].x = existing.dots[i].x;
            newGroup.dots[i].y = existing.dots[i].y;
            newGroup.dots[i].vx = existing.dots[i].vx;
            newGroup.dots[i].vy = existing.dots[i].vy;
          }
        }
        groupsRef.current.set(id, newGroup);
      }
    }
  }, [buildGroup]);

  useEffect(() => {
    if (!hydrated || !motionEnabled || !mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let vw = window.innerWidth;
    let vh = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, window.innerHeight * 2);

    const resize = () => {
      vw = window.innerWidth;
      vh = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, window.innerHeight * 2);
      canvas.width = vw * dpr;
      canvas.height = vh * dpr;
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    document.fonts.ready.then(() => { resize(); rebuildAll(); });
    const rt1 = setTimeout(() => { resize(); rebuildAll(); }, 500);
    const rt2 = setTimeout(() => { resize(); rebuildAll(); }, 2000);
    const rt3 = setTimeout(() => { resize(); rebuildAll(); }, 5000);

    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY + window.scrollY;
    };
    const onClick = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY + window.scrollY;
      mouseRef.current.clicked = true;
      if ("ontouchstart" in window) {
        setTimeout(() => { mouseRef.current.x = -9999; mouseRef.current.y = -9999; }, 50);
      }
    };
    const onTouchEnd = () => { mouseRef.current.x = -9999; mouseRef.current.y = -9999; };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("resize", resize);

    let c1 = [80, 160, 220], c2 = [160, 80, 220], c3 = [220, 80, 180];
    const updateColors = () => {
      const light = document.documentElement.classList.contains("light");
      c1 = light ? [15, 50, 140] : [80, 160, 220];
      c2 = light ? [90, 10, 150] : [160, 80, 220];
      c3 = light ? [150, 15, 90] : [220, 80, 180];
    };
    updateColors();
    const themeObserver = new MutationObserver(updateColors);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const MORPH = 300;
    const EASE = 60;
    const REPEL_R = 160;
    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, vw, vh);
      const t = frame * 0.008;
      const m = mouseRef.current;
      const wasClicked = m.clicked;
      if (wasClicked) m.clicked = false;

      const scrollTop = window.scrollY;
      const viewTop = scrollTop - 300;
      const viewBottom = scrollTop + window.innerHeight + 300;

      for (const group of groupsRef.current.values()) {
        const inRange = group.centerY >= viewTop - 400 && group.centerY <= viewBottom + 400;
        if (!inRange) continue;

        // Each group has its own morph cycle, starts at text when first seen
        if (!group.seen) { group.seen = true; group.localFrame = 0; }
        group.localFrame++;

        const cycle = group.localFrame % (MORPH * 2);
        const count = group.dots.length;

        // iconBlend: 0 = showing text, 1 = showing icon
        // Quintic ease for ultra-smooth transitions
        const ease5 = (p: number) => { const t = Math.max(0, Math.min(1, p)); return t * t * t * (t * (t * 6 - 15) + 10); };
        
        let iconBlend = 0;
        if (cycle < EASE) {
          const e = ease5(cycle / EASE);
          iconBlend = 1 - e;
          for (let i = 0; i < count; i++) {
            group.dots[i].homeX = group.iconTargets[i][0] + (group.textTargets[i][0] - group.iconTargets[i][0]) * e;
            group.dots[i].homeY = group.iconTargets[i][1] + (group.textTargets[i][1] - group.iconTargets[i][1]) * e;
          }
        } else if (cycle < MORPH) {
          iconBlend = 0;
        } else if (cycle < MORPH + EASE) {
          const e = ease5((cycle - MORPH) / EASE);
          iconBlend = e;
          for (let i = 0; i < count; i++) {
            group.dots[i].homeX = group.textTargets[i][0] + (group.iconTargets[i][0] - group.textTargets[i][0]) * e;
            group.dots[i].homeY = group.textTargets[i][1] + (group.iconTargets[i][1] - group.textTargets[i][1]) * e;
          }
        } else {
          iconBlend = 1;
        }

        for (let i = 0; i < count; i++) {
          const d = group.dots[i];
          d.tx = d.homeX + Math.sin(t * 0.5 + d.phase) * 0.3;
          d.ty = d.homeY + Math.cos(t * 0.4 + d.phase * 1.5) * 0.2;

          let repelled = false;
          const dx = d.x - m.x;
          const dy = d.y - m.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < REPEL_R * REPEL_R && distSq > 1) {
            repelled = true;
            const dist = Math.sqrt(distSq);
            const f = (1 - dist / REPEL_R);
            const force = f * f * 22;
            d.vx += (dx / dist) * force;
            d.vy += (dy / dist) * force;
          }

          if (wasClicked) {
            const dist = Math.sqrt(distSq) || 1;
            const f = Math.max(0, 1 - dist / (REPEL_R * 3));
            const force = f * f * 35;
            d.vx += (dx / dist) * force + (Math.random() - 0.5) * 6;
            d.vy += (dy / dist) * force + (Math.random() - 0.5) * 6;
          }

          const spring = repelled ? 0.005 : 0.035;
          d.vx += (d.tx - d.x) * spring;
          d.vy += (d.ty - d.y) * spring;
          d.vx *= repelled ? 0.96 : 0.85;
          d.vy *= repelled ? 0.96 : 0.85;
          d.x += d.vx;
          d.y += d.vy;

          const speed = Math.sqrt(d.vx * d.vx + d.vy * d.vy);
          const speedN = Math.min(speed / 5, 1);
          const cT = (Math.sin(t * 0.4 + d.phase) + 1) / 2;
          const r = Math.round(c1[0] + (c2[0] - c1[0]) * cT + (c3[0] - c2[0]) * speedN);
          const g = Math.round(c1[1] + (c2[1] - c1[1]) * cT + (c3[1] - c2[1]) * speedN);
          const b = Math.round(c1[2] + (c2[2] - c1[2]) * cT + (c3[2] - c2[2]) * speedN);
          const sz = d.baseSize * (1.0 + speedN * 0.4);
          // Extra particles fade out when in icon mode
          const isExtra = i >= group.iconCoreCount;
          const fadeOut = isExtra ? 1 - iconBlend : 1;
          const alpha = (0.75 + speedN * 0.2) * fadeOut;
          if (alpha < 0.01) continue;

          ctx.beginPath();
          ctx.arc(d.x, d.y, sz * 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.04})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(d.x, d.y, sz, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.fill();

          if (sz > 0.8) {
            ctx.beginPath();
            ctx.arc(d.x, d.y, sz * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${alpha * 0.15})`;
            ctx.fill();
          }
        }
      }

      frame++;
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      themeObserver.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", resize);
      clearTimeout(rt1);
      clearTimeout(rt2);
      clearTimeout(rt3);
    };
  }, [hydrated, motionEnabled, mounted, rebuildAll]);

  return (
    <ConnectorCtx.Provider value={{ register, unregister }}>
      {children}
      {hydrated && motionEnabled && mounted && createPortal(
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute top-0 left-0 z-[1]"
          aria-hidden
        />,
        document.body
      )}
    </ConnectorCtx.Provider>
  );
}

/* ── section connector marker ─────────────────────────────────────────────── */

let connectorId = 0;

export function SectionConnector({ label, className = "" }: { label: string; className?: string }) {
  const ctx = useContext(ConnectorCtx);
  const ref = useRef<HTMLDivElement>(null);
  const idRef = useRef(`connector-${connectorId++}`);

  useEffect(() => {
    if (!ctx || !ref.current) return;
    ctx.register(idRef.current, label, ref.current);
    return () => ctx.unregister(idRef.current);
  }, [ctx, label]);

  return <div ref={ref} className={`h-[90px] sm:h-[130px] ${className}`} aria-hidden />;
}
