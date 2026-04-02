"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { profile } from "@/data/profile";
import { scrollToId } from "@/lib/utils";
import { useMotionPreference } from "../motion-provider";

/* ── types ────────────────────────────────────────────────────────────────── */

interface TermLine {
  type: "input" | "output" | "error" | "blank";
  text: string;
  cls?: string;
}

type CmdHandler = (args: string[]) => TermLine[];

/* ── short, clean command handlers ────────────────────────────────────────── */

const T = "text-slate-700 dark:text-slate-200";
const TD = "text-slate-500 dark:text-slate-400";
const TA = "text-sky-600 dark:text-sky-400";
const TP = "text-purple-600 dark:text-purple-400";
const TG = "text-emerald-600 dark:text-emerald-400";
const TH = "text-pink-600 dark:text-pink-400";

const COMMANDS: Record<string, CmdHandler> = {
  help: () => [
    { type: "output", text: "Commands", cls: `${TA} font-semibold` },
    { type: "output", text: "  whoami       who am I", cls: T },
    { type: "output", text: "  skills       tech stack by category", cls: T },
    { type: "output", text: "  projects     things I built", cls: T },
    { type: "output", text: "  experience   career timeline", cls: T },
    { type: "output", text: "  contact      reach me", cls: T },
    { type: "output", text: "  neofetch     system info", cls: TD },
    { type: "output", text: "  goto <sec>   scroll to section", cls: TD },
    { type: "output", text: "  theme        toggle dark/light", cls: TD },
    { type: "output", text: "  clear        clear terminal", cls: TD },
  ],

  whoami: () => [
    { type: "output", text: profile.name, cls: `${TA} font-semibold` },
    { type: "output", text: profile.title, cls: T },
    { type: "output", text: profile.location, cls: TD },
  ],

  neofetch: () => {
    const role = profile.experience[0]?.role ?? "Engineer";
    const company = profile.experience[0]?.company ?? "";
    const langs = profile.skills["Languages"]?.map(s => s.name).slice(0, 5).join(", ") ?? "";
    const tools = profile.skills["Debug and Tools"]?.map(s => s.name).slice(0, 3).join(", ") ?? "";
    const since = profile.experience[profile.experience.length - 1]?.dates?.split("—")[0]?.trim() ?? "2021";

    return [
      { type: "output", text: `${profile.name}@portfolio`, cls: `${TA} font-semibold` },
      { type: "output", text: `------------------------------`, cls: TD },
      { type: "blank", text: "" },
      { type: "output", text: `  OS      Portfolio v2.0`, cls: T },
      { type: "output", text: `  Host    ${profile.location}`, cls: T },
      { type: "output", text: `  Kernel  Next.js 16 / React 18`, cls: T },
      { type: "output", text: `  Shell   Interactive Terminal`, cls: T },
      { type: "blank", text: "" },
      { type: "output", text: `  Role    ${role}`, cls: T },
      { type: "output", text: `  Work    ${company}`, cls: T },
      { type: "output", text: `  Lang    ${langs}`, cls: T },
      { type: "output", text: `  Tools   ${tools}`, cls: T },
      { type: "output", text: `  Uptime  Since ${since}`, cls: T },
      { type: "blank", text: "" },
      { type: "output", text: `  ██ ██ ██ ██ ██ ██ ██ ██`, cls: TH },
    ];
  },

  skills: () => {
    const lines: TermLine[] = [];
    for (const [cat, skills] of Object.entries(profile.skills)) {
      const names = (skills as { name: string }[]).map(s => s.name);
      lines.push({ type: "output", text: `▸ ${cat}`, cls: `${TH} font-semibold` });
      lines.push({ type: "output", text: `  ${names.join(" · ")}`, cls: T });
    }
    return lines;
  },

  projects: () => {
    const lines: TermLine[] = [];
    profile.projects.forEach((p, i) => {
      lines.push({ type: "output", text: `${i + 1}. ${p.title}`, cls: `${TP} font-semibold` });
      lines.push({ type: "output", text: `   ${p.description}`, cls: T });
      lines.push({ type: "output", text: `   ${p.tech.join(" · ")}`, cls: TD });
    });
    return lines;
  },

  experience: () => {
    const lines: TermLine[] = [];
    profile.experience.slice(0, 5).forEach((e) => {
      lines.push({ type: "output", text: `● ${e.role}`, cls: `${TG} font-semibold` });
      lines.push({ type: "output", text: `  ${e.company} · ${e.dates}`, cls: T });
      lines.push({ type: "output", text: `  ${e.location}`, cls: TD });
    });
    return lines;
  },

  contact: () => [
    { type: "output", text: "Email", cls: `${TA} font-semibold` },
    { type: "output", text: `  ${profile.contact.email}`, cls: T },
    { type: "output", text: "Links", cls: `${TA} font-semibold` },
    { type: "output", text: `  ${profile.social.github}`, cls: T },
    { type: "output", text: `  ${profile.social.linkedin}`, cls: T },
  ],

  goto: (args) => {
    const target = args[0]?.toLowerCase();
    const valid = ["home", "about", "skills", "experience", "projects", "github", "education", "testimonials", "contact"];
    if (!target || !valid.includes(target)) {
      return [{ type: "error", text: `goto <${valid.join(" | ")}>` }];
    }
    setTimeout(() => scrollToId(target), 150);
    return [{ type: "output", text: `→ ${target}`, cls: TG }];
  },

  theme: () => {
    if (typeof document !== "undefined") {
      const html = document.documentElement;
      const next = html.classList.contains("light") ? "dark" : "light";
      html.classList.remove("light", "dark");
      html.classList.add(next);
      return [{ type: "output", text: `Switched to ${next}`, cls: TG }];
    }
    return [{ type: "error", text: "unavailable" }];
  },

  sudo: (args) => {
    if (args.join(" ").includes("rm -rf")) {
      return [{ type: "output", text: "Nice try. 😎", cls: TG }];
    }
    return [{ type: "error", text: `sudo: ${args[0] ?? "?"}: not found` }];
  },

  echo: (args) => [{ type: "output", text: args.join(" "), cls: T }],
  date: () => [{ type: "output", text: new Date().toLocaleString(), cls: T }],
  ping: (args) => [{ type: "output", text: `${args[0] || "amir"}: 0.04ms`, cls: T }],
};

const COMMAND_NAMES = Object.keys(COMMANDS);

const DEMO_WORDS = ["help", "whoami", "neofetch", "skills", "projects", "experience"];

/* ── component ────────────────────────────────────────────────────────────── */

export function InteractiveTerminal({ className }: { className?: string }) {
  const { hydrated, motionEnabled } = useMotionPreference();
  const enableMotion = hydrated && motionEnabled;

  const [lines, setLines] = useState<TermLine[]>([
    { type: "output", text: `${profile.name}`, cls: "text-emerald-500 dark:text-emerald-400 font-semibold" },
    { type: "output", text: `${profile.experience[0]?.role} @ ${profile.experience[0]?.company}`, cls: TD },
    { type: "blank", text: "" },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [focused, setFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demoWordIdx = useRef(0);
  const demoActive = useRef(false);
  const demoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scroll = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  const exec = useCallback((raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const [cmd, ...args] = trimmed.split(/\s+/);
    const key = cmd.toLowerCase();

    if (key === "clear") {
      setLines([]);
      setHistory((p) => [...p, trimmed]);
      setHistIdx(-1);
      return;
    }
    if (key === "history") {
      setLines((p) => [...p, { type: "input", text: trimmed }, ...history.map((h, i) => ({
        type: "output" as const, text: `  ${i + 1}  ${h}`, cls: TD,
      }))]);
      setHistory((p) => [...p, trimmed]);
      setHistIdx(-1);
      scroll();
      return;
    }

    const handler = COMMANDS[key];
    const out = handler
      ? handler(args)
      : [{ type: "error" as const, text: `${key}: not found` }];
    setLines((p) => [...p, { type: "input", text: trimmed }, ...out]);
    setHistory((p) => [...p, trimmed]);
    setHistIdx(-1);
    scroll();
  }, [history, scroll]);

  const execRef = useRef(exec);
  useEffect(() => { execRef.current = exec; }, [exec]);

  const stopDemo = useCallback(() => {
    demoActive.current = false;
    if (demoIntervalRef.current) { clearInterval(demoIntervalRef.current); demoIntervalRef.current = null; }
    if (idleRef.current) { clearTimeout(idleRef.current); idleRef.current = null; }
  }, []);

  const scheduleDemo = useCallback(() => {
    stopDemo();
    idleRef.current = setTimeout(() => {
      if (demoActive.current) return;
      demoActive.current = true;

      const word = DEMO_WORDS[demoWordIdx.current % DEMO_WORDS.length];
      demoWordIdx.current++;
      let charIdx = 0;
      let phase: "typing" | "pause" | "deleting" = "typing";

      demoIntervalRef.current = setInterval(() => {
        if (!demoActive.current) { stopDemo(); return; }

        if (phase === "typing") {
          charIdx++;
          setInput(word.slice(0, charIdx));
          if (charIdx >= word.length) {
            phase = "pause";
            // Pause at full word for a beat, then start deleting
            if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
            demoIntervalRef.current = setTimeout(() => {
              if (!demoActive.current) return;
              phase = "deleting";
              demoIntervalRef.current = setInterval(() => {
                if (!demoActive.current) { stopDemo(); return; }
                charIdx--;
                setInput(word.slice(0, charIdx));
                if (charIdx <= 0) {
                  stopDemo();
                  scheduleDemo();
                }
              }, 50) as unknown as ReturnType<typeof setInterval>;
            }, 1200) as unknown as ReturnType<typeof setInterval>;
          }
        }
      }, 90);
    }, 6000);
  }, [stopDemo]);

  const resetIdle = useCallback(() => {
    const wasDemo = demoActive.current;
    stopDemo();
    if (wasDemo) setInput("");
    scheduleDemo();
  }, [stopDemo, scheduleDemo]);

  useEffect(() => { scheduleDemo(); return stopDemo; }, [scheduleDemo, stopDemo]);
  useEffect(() => { scroll(); }, [lines, scroll]);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    resetIdle();
    if (e.key === "Enter") { e.preventDefault(); exec(input); setInput(""); }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (!history.length) return; const n = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1); setHistIdx(n); setInput(history[n]); }
    else if (e.key === "ArrowDown") { e.preventDefault(); if (histIdx === -1) return; const n = histIdx + 1; if (n >= history.length) { setHistIdx(-1); setInput(""); } else { setHistIdx(n); setInput(history[n]); } }
    else if (e.key === "Tab") { e.preventDefault(); if (!input) return; const m = COMMAND_NAMES.filter((c) => c.startsWith(input.toLowerCase())); if (m.length === 1) setInput(m[0]); }
    else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); setLines([]); }
  };

  return (
    <motion.div
      className={`section-card relative overflow-hidden border-border-subtle bg-bg-secondary/95 dark:bg-bg-secondary/80 ${className ?? ""}`}
      key={enableMotion ? "t-m" : "t-s"}
      initial={!enableMotion ? false : { opacity: 0, y: 20 }}
      animate={!enableMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/10 via-transparent to-accent-blue/8 dark:from-accent-purple/25 dark:to-accent-blue/20" aria-hidden />
      <div className="relative space-y-3 p-4">
        {/* Title bar */}
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="ml-2 font-medium text-text-primary">amir@portfolio</span>
        </div>

        {/* Body */}
        <div
          ref={scrollRef}
          className="max-h-[240px] min-h-[140px] overflow-y-auto rounded-xl border border-border-subtle bg-bg-main/90 dark:bg-bg-main/70 p-3 font-mono text-xs shadow-inner sm:text-sm"
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((line, i) => (
            <div key={i} className={`whitespace-pre-wrap break-words leading-relaxed ${
              line.type === "error" ? "text-red-400 dark:text-red-400" :
              line.type === "input" ? "" :
              line.cls ?? T
            }`}>
              {line.type === "input" ? (
                <>
                  <span className="text-emerald-500 dark:text-emerald-400">$</span>
                  <span className="text-emerald-700 dark:text-emerald-300"> {line.text}</span>
                </>
              ) : line.type === "blank" ? <br /> : line.text}
            </div>
          ))}

          {/* Prompt */}
          <div className="flex items-start gap-0">
            <span className="text-emerald-500 dark:text-emerald-400 shrink-0">$</span>
            <span className="shrink-0">&nbsp;</span>
            <div className="relative flex-1 min-w-0">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); resetIdle(); }}
                onKeyDown={onKey}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="w-full bg-transparent text-slate-800 dark:text-slate-100 outline-none caret-transparent font-mono text-xs sm:text-sm"
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                aria-label="Terminal input"
              />
              <span className="pointer-events-none absolute top-0 left-0 font-mono text-xs sm:text-sm" aria-hidden>
                <span className="invisible whitespace-pre">{input}</span>
                <span
                  className="terminal-cursor inline-block w-[7px] h-[14px] sm:h-[16px] align-text-bottom"
                  style={{ backgroundColor: "#10b981", opacity: focused ? undefined : 0.4 }}
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
