"use client";

import { Layers, Crosshair, MapPin } from "lucide-react";
import { profile } from "@/data/profile";
import { BrandMark } from "./brand-mark";
import { Clock } from "./clock";

const STACK = ["ROCm", "Linux kernel", "C/C++"];
const FOCUS = ["Systems", "HPC", "ML", "formal methods"];

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s) => (
        <span
          key={s}
          className="mono rounded-md border border-border-subtle bg-surface px-2 py-1 text-[11px] text-text-secondary transition-colors hover:border-accent/40 hover:text-text-primary"
        >
          {s}
        </span>
      ))}
    </div>
  );
}

/**
 * Hero "status" card, redesigned as a branded ID/console plate: a gradient
 * identity header band (monogram + role + ONLINE LED), a featured live-clock +
 * location block, and stack/focus as chips. Eye-catching through composition
 * and a real color block — no animated "signal" graphic.
 */
export function StatusCard() {
  return (
    <div className="panel ticks relative overflow-hidden rounded-2xl">
      {/* identity header band — the bold color block */}
      <div
        className="flex items-center justify-between gap-3 px-5 py-3.5"
        style={{ background: "var(--gradient)" }}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <BrandMark className="h-8 w-8 shrink-0 rounded-lg" />
          <div className="min-w-0 leading-tight">
            <div className="font-display text-sm font-semibold text-text-on-accent">
              Amir Shetaia
            </div>
            <div className="mono truncate text-[11px] text-text-on-accent/85">
              Sr. Software Engineer · AMD
            </div>
          </div>
        </div>
        <span className="mono inline-flex shrink-0 items-center gap-1.5 rounded-full bg-black/15 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-text-on-accent">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
          </span>
          ONLINE
        </span>
      </div>

      {/* body */}
      <div className="space-y-4 p-5 sm:p-6">
        {/* featured — live local time + location */}
        <div className="ticks relative flex items-end justify-between gap-4 rounded-xl border border-border-subtle bg-surface p-4">
          <div className="min-w-0">
            <div className="eyebrow">local time</div>
            <Clock className="num text-gradient mt-1.5 block text-2xl font-semibold tracking-tight sm:text-[28px]" />
          </div>
          <div className="shrink-0 text-right">
            <div className="eyebrow inline-flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-accent" />
              location
            </div>
            <div className="mt-1.5 text-sm font-medium text-text-primary">Toronto, ON</div>
            <div className="mono text-[11px] text-text-faint">Canada · UTC−5</div>
          </div>
        </div>

        {/* stack */}
        <div>
          <div className="eyebrow mb-2 flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-accent" /> stack
          </div>
          <Chips items={STACK} />
        </div>

        {/* focus */}
        <div>
          <div className="eyebrow mb-2 flex items-center gap-2">
            <Crosshair className="h-3.5 w-3.5 text-accent" /> focus
          </div>
          <Chips items={FOCUS} />
        </div>

        {/* now */}
        <div className="relative overflow-hidden rounded-lg border border-border-subtle bg-surface p-3 pl-4">
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-0.5"
            style={{ background: "var(--gradient)" }}
          />
          <div className="eyebrow mb-1">now</div>
          <p className="text-xs leading-relaxed text-text-secondary">{profile.hero.now}</p>
        </div>
      </div>
    </div>
  );
}
