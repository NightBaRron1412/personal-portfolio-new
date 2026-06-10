"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { InstrumentField } from "./components/instrument-field";
import { BrandMark } from "./components/brand-mark";

/**
 * 404 — "signal lost" in the Instrument design language: gradient glyph with a
 * periodic teal/violet glitch, a telemetry readout, the reactive constellation
 * backdrop, and the brand lockup. Theme-aware + reduced-motion safe (the global
 * dot-grid/aurora come from globals.css; the glitch animation is disabled under
 * prefers-reduced-motion).
 */
export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-6 py-16">
      <InstrumentField />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center">
        {/* brand lockup (doubles as a home link) */}
        <Link href="/" className="group mb-10 inline-flex items-center gap-2.5">
          <BrandMark className="h-7 w-7 rounded-lg shadow-soft transition-transform duration-300 group-hover:scale-105" />
          <span className="mono text-sm font-medium tracking-tight text-text-primary">
            amir<span className="text-text-faint">.</span>shetaia
          </span>
        </Link>

        <div className="panel ticks w-full p-8 text-center sm:p-10">
          <p className="eyebrow inline-flex items-center gap-2">
            <span className="pulse-dot relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            signal lost
          </p>

          {/* glitching 404 */}
          <div className="relative mt-4 inline-block select-none leading-none">
            <span className="text-gradient block font-display text-8xl font-semibold leading-none sm:text-9xl">
              404
            </span>
            <span
              aria-hidden
              className="glitch-404 glitch-404-a absolute inset-0 font-display text-8xl font-semibold leading-none sm:text-9xl"
            >
              404
            </span>
            <span
              aria-hidden
              className="glitch-404 glitch-404-b absolute inset-0 font-display text-8xl font-semibold leading-none sm:text-9xl"
            >
              404
            </span>
          </div>

          <div className="gradient-rule mx-auto mt-5 h-px w-24 opacity-60" />

          <p className="mx-auto mt-5 max-w-sm leading-relaxed text-text-secondary">
            This route isn&apos;t on the map — it moved, or it never existed.
          </p>

          {/* telemetry readout */}
          <dl className="mono mx-auto mt-7 max-w-[260px] space-y-2 rounded-lg border border-border-subtle bg-surface p-4 text-left text-xs">
            <Row k="status" v="404 · not_found" accent />
            <Row k="signal" v="no route" />
            <Row k="recommended" v="return to base" />
          </dl>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-semibold text-[#0b0f17] shadow-glow transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--gradient)" }}
            >
              Back to home <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-border-subtle px-5 text-sm font-medium text-text-primary transition-colors hover:border-accent hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4" /> Go back
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Row({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-text-faint">{k}</dt>
      <dd className={accent ? "text-accent" : "text-text-secondary"}>{v}</dd>
    </div>
  );
}
