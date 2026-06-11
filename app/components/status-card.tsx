"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Clock } from "./clock";
import { PanelLabel } from "./panel-label";

const TZ = "America/Toronto";

/** Live local date (updates each minute). */
function useLocalDate() {
  const [date, setDate] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      timeZone: TZ,
    });
    const update = () => setDate(fmt.format(new Date()));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);
  return date;
}

/**
 * Hero side card — a "where & when" telemetry readout. Deliberately NOT a
 * restatement of the name/role/stack already in the headline; it shows the one
 * thing nothing else on the page does: live local time + location. The big
 * gradient clock is the focal element.
 */
export function StatusCard() {
  const date = useLocalDate();
  return (
    <div className="panel ticks relative overflow-hidden rounded-2xl p-6 sm:p-7">
      {/* soft corner glow (static) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--gradient)" }}
      />

      {/* header */}
      <div className="relative flex items-center justify-between">
        <PanelLabel>local time</PanelLabel>
        <span className="mono inline-flex items-center gap-1.5 text-[11px] tracking-wide text-accent">
          <span className="pulse-dot relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          LIVE
        </span>
      </div>

      {/* big live clock */}
      <div className="relative mt-5">
        <Clock
          showZone={false}
          className="num text-gradient block text-[2.75rem] font-bold leading-none tracking-tight sm:text-5xl"
        />
        <div className="mono mt-3 text-xs text-text-faint" suppressHydrationWarning>
          {date ?? "—"} · Eastern · UTC−5
        </div>
      </div>

      {/* divider */}
      <div className="gradient-rule relative mt-6 h-px w-full opacity-60" aria-hidden />

      {/* location */}
      <div className="relative mt-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-accent-soft text-accent">
            <MapPin className="h-3.5 w-3.5" />
          </span>
          <div>
            <div className="eyebrow">based in</div>
            <div className="mt-1 text-sm font-medium text-text-primary">Toronto, Ontario</div>
            <div className="mono text-[11px] text-text-faint">Canada</div>
          </div>
        </div>
        <div className="num text-right text-[11px] leading-relaxed text-text-faint">
          43.65° N
          <br />
          79.38° W
        </div>
      </div>
    </div>
  );
}
