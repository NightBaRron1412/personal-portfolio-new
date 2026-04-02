"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────────
 * Boot log — each group has breathing room.  Timings are hand-tuned for a
 * ~5.5 s experience before the exit sequence starts.
 * ──────────────────────────────────────────────────────────────────────────── */
interface BootLine { text: string; mobile?: string; delay: number; color?: string }

const BOOT_LINES: BootLine[] = [
  // ── phase 1: kernel / ACPI ──
  { text: "[    0.000000] amir_shetaia: initializing runtime ...",            mobile: "[0.000] initializing runtime ...",            delay: 400 },
  { text: "[    0.004821] ACPI: RSDP validated, mapping system tables",      mobile: "[0.004] ACPI: RSDP validated",                  delay: 800 },
  { text: "[    0.012490] pci 0000:c1:00.0: GPU detected — gfx942 [MI300X]", mobile: "[0.012] GPU detected — MI300X",                  delay: 1300, color: "gpu" },

  // ── phase 2: driver / firmware ──
  { text: "[    0.019773] amdgpu: VRAM 192GB HBM3 · PCIe Gen5 x16 · 304 CU", mobile: "[0.019] VRAM 192GB HBM3 · 304 CU",             delay: 1900, color: "gpu" },
  { text: "[    0.027104] rocm: loading KFD topology ... 8 nodes enumerated",  mobile: "[0.027] rocm: KFD topology ... 8 nodes",      delay: 2500 },
  { text: "[    0.034882] hip: runtime v6.3.0 · compiler: amd-clang-19",       mobile: "[0.034] hip: v6.3.0 · amd-clang-19",          delay: 3000 },

  // ── phase 3: compute readiness ──
  { text: "[    0.041250] scheduler: 61440 wavefronts ready across 304 CU",   mobile: "[0.041] 61440 wavefronts ready",                delay: 3500 },
  { text: "[    0.048019] verify: formal proof obligations discharged ✓",     mobile: "[0.048] proof obligations discharged ✓",       delay: 4000, color: "ok" },
  { text: "[    0.053771] mem_barrier: __threadfence_system() ... coherent",   mobile: "[0.053] __threadfence ... coherent",           delay: 4400 },
  { text: "[    0.060000] portfolio: all subsystems nominal",                 mobile: "[0.060] all subsystems nominal",               delay: 4800, color: "ok" },

  // ── phase 4: name card ──
  { text: "",                                                                delay: 5300 },
  { text: "  ┌──────────────────────────────────────────────┐",              mobile: " ┌────────────────────────────────┐",              delay: 5600, color: "card" },
  { text: "  │  Amir Shetaia                                │",              mobile: " │ Amir Shetaia                   │",              delay: 5850, color: "card" },
  { text: "  │  Senior Software Engineer · AMD ROCm         │",              mobile: " │ Sr. Software Eng · AMD ROCm    │",             delay: 6100, color: "card" },
  { text: "  │  Systems · HPC · GPU Compute · ML Infra      │",              mobile: " │ Systems · HPC · GPU · ML       │",             delay: 6350, color: "card" },
  { text: "  └──────────────────────────────────────────────┘",              mobile: " └────────────────────────────────┘",              delay: 6600, color: "card" },

  // ── phase 5: handoff ──
  { text: "",                                                                delay: 7000 },
  { text: "[    0.071339] ready. transferring control to userspace ...",      mobile: "[0.071] transferring to userspace ...",          delay: 7400, color: "ready" },
];

function useIsMobile() {
  const [mobile, setMobile] = useState(() => {
    if (typeof window !== "undefined") return window.innerWidth < 640;
    return false;
  });
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 639px)");
    setMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return mobile;
}

/** ms after the last line before beginning exit */
const POST_PAUSE = 800;
/** ms for the cinematic exit (scale + blur + fade) */
const EXIT_DURATION = 1000;

/* ────────────────────────────────────────────────────────────────────────── */
/*  GPU memory-cell grid background (canvas)                                 */
/* ────────────────────────────────────────────────────────────────────────── */
function MemoryGrid() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
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

    const CELL = 18;
    const cols = Math.ceil(w / CELL) + 1;
    const rows = Math.ceil(h / CELL) + 1;
    const field = Array.from({ length: cols * rows }, () => Math.random());

    let frame = 0;
    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const v = field[r * cols + c];
          const wave = Math.sin(frame * 0.006 + c * 0.14 + r * 0.1) * 0.5 + 0.5;
          const active = v * wave;
          if (active > 0.86) {
            ctx.fillStyle = `rgba(49,112,142,${((active - 0.86) / 0.14) * 0.09})`;
            ctx.fillRect(c * CELL, r * CELL, CELL - 1, CELL - 1);
          }
        }
      }
      // horizontal scan-line
      const scanY = (frame * 0.8) % h;
      const g = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
      g.addColorStop(0, "rgba(108,12,156,0)");
      g.addColorStop(0.5, "rgba(108,12,156,0.035)");
      g.addColorStop(1, "rgba(108,12,156,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, scanY - 60, w, 120);
      frame++;
      raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 z-0" aria-hidden />;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Single boot-log line                                                     */
/* ────────────────────────────────────────────────────────────────────────── */
function BootLineText({ text, color }: { text: string; color?: string }) {
  if (text === "") return <br />;

  const cls =
    color === "gpu"   ? "text-accent-pink/80" :
    color === "ok"    ? "text-emerald-400/90" :
    color === "card"  ? "text-accent-blue/90" :
    color === "ready" ? "text-emerald-400" :
    "text-text-secondary/70";

  if (text.includes("✓")) {
    const [before] = text.split("✓");
    return (
      <span className="text-text-secondary/70">
        {before}<span className="text-emerald-400">✓</span>
      </span>
    );
  }

  return <span className={cls}>{text}</span>;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  LoadingScreen                                                            */
/* ────────────────────────────────────────────────────────────────────────── */
export type LoadingPhase = "boot" | "exit" | "done";

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const isMobile = useIsMobile();
  const [lines, setLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [phase, setPhase] = useState<LoadingPhase>("boot");
  const [termIn, setTermIn] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const called = useRef(false);

  const finish = useCallback(() => {
    if (called.current) return;
    called.current = true;
    onComplete();
  }, [onComplete]);

  // Lock body scroll while loading screen is active
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  /* ── orchestrate ── */
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // terminal entrance
    timers.push(setTimeout(() => setTermIn(true), 200));

    const lastTime = BOOT_LINES[BOOT_LINES.length - 1].delay;
    const totalBoot = lastTime + POST_PAUSE;

    // schedule lines
    BOOT_LINES.forEach((l, i) => {
      timers.push(setTimeout(() => setLines(i + 1), l.delay));
    });

    // Start progress animation immediately with CSS transition (GPU-accelerated, mobile-friendly)
    timers.push(setTimeout(() => setProgress(100), 50));

    // Smooth counter for percentage display
    const t0 = performance.now();
    let rafId: number;
    const counterTick = () => {
      const elapsed = performance.now() - t0;
      const raw = Math.min(1, elapsed / totalBoot);
      const eased = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
      setDisplayProgress(eased * 100);
      if (raw < 1) rafId = requestAnimationFrame(counterTick);
      else setDisplayProgress(100);
    };
    rafId = requestAnimationFrame(counterTick);

    // exit phase
    timers.push(setTimeout(() => setPhase("exit"), totalBoot));
    // done
    timers.push(setTimeout(() => { setPhase("done"); finish(); }, totalBoot + EXIT_DURATION));

    return () => { timers.forEach(clearTimeout); cancelAnimationFrame(rafId); };
  }, [finish]);

  // auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  if (phase === "done") return null;

  /* ── timing ── */
  const lastTime = BOOT_LINES[BOOT_LINES.length - 1].delay;
  const totalBoot = lastTime + POST_PAUSE;

  /* ── styles ── */
  const screen: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg-main)",
    opacity: phase === "exit" ? 0 : 1,
    transform: phase === "exit" ? "scale(1.06)" : "scale(1)",
    filter: phase === "exit" ? "blur(12px)" : "blur(0px)",
    transition: [
      `opacity ${EXIT_DURATION}ms cubic-bezier(0.4,0,0.2,1)`,
      `transform ${EXIT_DURATION}ms cubic-bezier(0.4,0,0.2,1)`,
      `filter ${EXIT_DURATION}ms cubic-bezier(0.4,0,0.2,1)`,
    ].join(", "),
  };

  const termStyle: React.CSSProperties = {
    opacity: termIn ? 1 : 0,
    transform: termIn ? "translateY(0) scale(1)" : "translateY(24px) scale(0.96)",
    transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
  };

  return (
    <div style={screen}>
      <MemoryGrid />
      <div className="animate-noise pointer-events-none absolute inset-0 z-[1] opacity-[0.03]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)" }}
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-2xl px-5 sm:px-6" style={termStyle}>
        {/* Terminal */}
        <div className="loading-terminal overflow-hidden rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.5)] backdrop-blur-md">
          {/* Title bar */}
          <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] px-4 py-2.5">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/70" />
            </div>
            <span className="ml-2 select-none font-mono text-[10px] tracking-wider text-text-secondary/40">
              dmesg — amir@build-node
            </span>
          </div>

          {/* Log */}
          <div
            ref={scrollRef}
            className="max-h-[420px] overflow-y-auto whitespace-pre px-3 py-3 font-mono text-[11px] leading-[1.8] sm:px-4 sm:text-xs"
          >
            {BOOT_LINES.slice(0, lines).map((l, i) => (
              <div key={i} className="loading-line">
                <BootLineText text={isMobile && l.mobile ? l.mobile : l.text} color={l.color} />
              </div>
            ))}
            {phase === "boot" && lines > 0 && lines < BOOT_LINES.length && (
              <span className="loading-cursor" aria-hidden>█</span>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4 flex items-center gap-3">
          <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
            <div 
              className="loading-progress h-full rounded-full" 
              style={{ 
                width: `${Math.min(progress, 100)}%`,
                transition: `width ${totalBoot}ms cubic-bezier(0.4, 0.0, 0.2, 1)`
              }} 
            />
          </div>
          <span className="font-mono text-[10px] tabular-nums text-text-secondary/35">
            {Math.round(Math.min(displayProgress, 100))}%
          </span>
        </div>

        {/* Skip */}
        <button
          onClick={finish}
          className="mx-auto mt-5 block select-none font-mono text-[10px] tracking-[0.15em] text-text-secondary/20 transition-colors duration-300 hover:text-text-secondary/60 focus:outline-none"
        >
          SKIP
        </button>
      </div>
    </div>
  );
}
