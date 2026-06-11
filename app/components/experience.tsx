"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, MapPin, Plane } from "lucide-react";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { Reveal } from "./reveal";

const ARC = ["Robotics", "Embedded", "Cloud", "HPC · Research", "GPU Drivers"];

// Fade the rail at both ends so it doesn't stub past the first/last node.
const RAIL_FADE = "linear-gradient(to bottom, transparent, #000 5%, #000 95%, transparent)";

export function Experience() {
  const railRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(0);

  // Progress line fills + a glow "comet" tracks the scroll through the timeline.
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 78%", "end 62%"],
  });
  const headTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const jobs = profile.experience;
  const firstEgypt = jobs.findIndex((j) => /Egypt/.test(j.location));

  return (
    <div className="space-y-10">
      {/* narrative arc */}
      <Reveal>
        <div className="flex flex-col gap-4">
          <p className="max-w-2xl leading-relaxed text-text-secondary">
            Nine roles, three countries, one throughline — moving steadily toward the
            layers underneath: from robotics benches in Cairo to data-center GPUs in Toronto.
          </p>
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
            {ARC.map((stage, i) => {
              const current = i === ARC.length - 1;
              return (
                <span key={stage} className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "mono rounded-md border px-2.5 py-1 text-xs transition-colors",
                      current
                        ? "border-transparent font-medium text-text-on-accent shadow-glow"
                        : "border-border-subtle bg-surface text-text-secondary"
                    )}
                    style={current ? { background: "var(--gradient)" } : undefined}
                  >
                    {stage}
                  </span>
                  {i < ARC.length - 1 ? (
                    <span aria-hidden className="text-text-faint">
                      →
                    </span>
                  ) : null}
                </span>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* journey timeline */}
      <div ref={railRef} className="relative">
        {/* rail — faint base (centered on left-5 / sm:left-6) */}
        <span
          aria-hidden
          className="absolute bottom-2 left-5 top-2 w-0.5 -translate-x-1/2 rounded-full bg-border-subtle sm:left-6"
          style={{ maskImage: RAIL_FADE, WebkitMaskImage: RAIL_FADE }}
        />
        {/* rail — gradient fill (scroll-linked, scaleY = composited) */}
        <motion.span
          aria-hidden
          className="absolute left-5 top-2 w-0.5 origin-top rounded-full sm:left-6"
          style={{
            x: "-50%",
            height: "calc(100% - 16px)",
            scaleY: scrollYProgress,
            background: "var(--gradient)",
            maskImage: RAIL_FADE,
            WebkitMaskImage: RAIL_FADE,
          }}
        />
        {/* traveling glow comet at the fill tip */}
        <motion.span
          aria-hidden
          className="absolute left-5 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full sm:left-6"
          style={{ top: headTop, background: "var(--accent)", boxShadow: "0 0 10px 2px var(--accent)" }}
        />

        <div className="space-y-3">
          {jobs.map((job, i) => {
            const isOpen = open === i;
            const hasType = "type" in job && (job as { type?: string }).type;
            const bullets = job.bullets.filter(
              (b) => b.trim().toLowerCase() !== job.summary.trim().toLowerCase()
            );
            return (
              <div key={`${job.company}-${i}`}>
                {/* relocation story beat */}
                {i === firstEgypt ? (
                  <Reveal>
                    <div className="relative my-6 flex items-center gap-3 pl-12 sm:pl-16">
                      <Plane className="h-3.5 w-3.5 shrink-0 text-accent" />
                      <span className="mono shrink-0 text-[11px] tracking-wide text-text-faint">
                        relocated · Egypt → Canada · 2024
                      </span>
                      <span aria-hidden className="gradient-rule h-px flex-1 opacity-50" />
                    </div>
                  </Reveal>
                ) : null}

                <Reveal delay={(i % 3) * 60}>
                  <div className="relative pl-12 sm:pl-16">
                    {/* node — centered on the same axis as the rail */}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute left-5 top-8 z-[1] h-3 w-3 -translate-x-1/2 rounded-full border-2 border-bg-secondary transition-transform duration-300 sm:left-6",
                        isOpen && "scale-[1.35]"
                      )}
                      style={{
                        background: isOpen ? "var(--gradient)" : "var(--accent)",
                        boxShadow: isOpen ? "0 0 0 4px var(--accent-soft)" : undefined,
                      }}
                    />

                    {/* card — same frosted glass as the other panels */}
                    <div
                      data-exp-card
                      className={cn(
                        "panel scroll-mt-24 rounded-xl transition-colors",
                        isOpen && "border-border-strong ring-1 ring-accent/15"
                      )}
                    >
                      <button
                        onClick={(e) => {
                          const willOpen = !isOpen;
                          setOpen(willOpen ? i : null);
                          // The expanded bullets can land below the fold on
                          // mobile — once they're laid out, bring the card into
                          // view so the details aren't off-screen.
                          if (willOpen) {
                            const card = e.currentTarget.closest("[data-exp-card]");
                            const reduce = window.matchMedia(
                              "(prefers-reduced-motion: reduce)"
                            ).matches;
                            window.setTimeout(() => {
                              card?.scrollIntoView({
                                behavior: reduce ? "auto" : "smooth",
                                block: "nearest",
                              });
                            }, 360);
                          }
                        }}
                        className="flex w-full items-start gap-3 p-4 text-left sm:gap-4 sm:p-5"
                        aria-expanded={isOpen}
                      >
                        <Logo
                          src={job.logo}
                          name={job.company}
                          className={cn(
                            "h-11 w-11 shrink-0 transition-all duration-300",
                            isOpen && "ring-2 ring-accent/40"
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-base font-semibold leading-snug text-text-primary">
                              {job.role}
                            </h3>
                            <span className="num shrink-0 text-[11px] text-text-faint">
                              {job.dates}
                            </span>
                          </div>
                          <div className="mono mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-text-secondary">
                            <span>
                              {job.company}
                              {hasType ? ` · ${(job as { type?: string }).type}` : ""}
                            </span>
                            <span className="inline-flex items-center gap-1 text-text-faint">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </span>
                          </div>
                          <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">
                            {job.summary}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            {job.tech.map((t) => (
                              <span
                                key={t}
                                className="mono rounded border border-border-subtle bg-surface px-1.5 py-0.5 text-[11px] text-text-faint"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                          {bullets.length ? (
                            <span className="mono mt-3 inline-flex items-center gap-1 text-[11px] text-text-secondary">
                              {isOpen ? "hide details" : "details"}
                              <ChevronDown
                                className={cn("h-3.5 w-3.5 text-accent transition-transform duration-300", isOpen && "rotate-180")}
                              />
                            </span>
                          ) : null}
                        </div>
                      </button>

                      {/* expandable bullets */}
                      <motion.div
                        initial={false}
                        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        {bullets.length ? (
                          <ul className="space-y-2 border-t border-border-subtle px-4 py-4 sm:mx-5 sm:px-[60px] sm:py-4">
                            {bullets.map((b, bi) => (
                              <li key={bi} className="flex gap-2.5 text-sm text-text-secondary">
                                <span className="mono mt-0.5 shrink-0 text-accent">›</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </motion.div>
                    </div>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
