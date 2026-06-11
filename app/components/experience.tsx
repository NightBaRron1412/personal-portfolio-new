"use client";

import { useRef, useState } from "react";
import { motion, useScroll } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Logo } from "./logo";
import { Reveal } from "./reveal";

const ARC = ["Robotics", "Embedded", "Cloud", "HPC · Research", "GPU Drivers"];

export function Experience() {
  const panelRef = useRef<HTMLDivElement>(null);
  // Controlled so the open row can light up its node / logo / background.
  const [open, setOpen] = useState<string>("exp-0");
  const { scrollYProgress } = useScroll({
    target: panelRef,
    offset: ["start 85%", "end 55%"],
  });
  return (
    <div className="space-y-6">
      {/* journey arc */}
      <Reveal>
        <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
          {ARC.map((stage, i) => {
            const current = i === ARC.length - 1;
            return (
              <span key={stage} className="flex items-center gap-1">
                <span
                  className={
                    "mono rounded-md border px-2.5 py-1 text-xs transition-colors " +
                    (current
                      ? "border-transparent font-medium text-text-on-accent shadow-glow"
                      : "border-border-subtle bg-surface text-text-secondary")
                  }
                  style={current ? { background: "var(--gradient)" } : undefined}
                >
                  {stage}
                </span>
                {i < ARC.length - 1 ? (
                  <ChevronRight className="h-3.5 w-3.5 text-text-faint" />
                ) : null}
              </span>
            );
          })}
        </div>
      </Reveal>

      {/* timeline */}
      <Reveal delay={80}>
        <div ref={panelRef} className="panel overflow-hidden">
          {/* scroll-fill spine — fills with the gradient as you move through the timeline */}
          <motion.span
            aria-hidden
            className="absolute left-[23px] top-0 z-10 h-full w-px origin-top sm:left-[27px]"
            style={{ scaleY: scrollYProgress, background: "var(--gradient)" }}
          />
          <Accordion
            type="single"
            collapsible
            value={open}
            onValueChange={setOpen}
            className="w-full"
          >
            {profile.experience.map((job, i) => {
              const isLast = i === profile.experience.length - 1;
              const isOpen = open === `exp-${i}`;
              const hasType = "type" in job && (job as { type?: string }).type;
              const bullets = job.bullets.filter(
                (b) => b.trim().toLowerCase() !== job.summary.trim().toLowerCase()
              );
              return (
                <div key={`${job.company}-${i}`} className="relative">
                  {/* spine + node */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-[23px] top-0 w-px bg-border-subtle sm:left-[27px]",
                      isLast ? "h-[34px]" : "h-full"
                    )}
                  />
                  {/* ping ring on the active node */}
                  {isOpen ? (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute left-[19px] top-[27px] h-2.5 w-2.5 rounded-full bg-accent sm:left-[23px]"
                      style={{ animation: "pulse 2.4s ease-out infinite" }}
                    />
                  ) : null}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-[19px] top-[27px] z-[1] h-2.5 w-2.5 rounded-full border-2 border-bg-secondary transition-all duration-300 sm:left-[23px]",
                      isOpen && "scale-[1.35]"
                    )}
                    style={{
                      background: isOpen ? "var(--gradient)" : "var(--accent)",
                      boxShadow: isOpen ? "0 0 0 4px var(--accent-soft)" : undefined,
                    }}
                  />

                  <AccordionItem
                    value={`exp-${i}`}
                    className={cn(
                      "rounded-lg border-border-subtle pl-9 pr-4 transition-colors last:border-b-0 hover:bg-surface/40 sm:pl-12 sm:pr-5",
                      isOpen && "bg-surface/30"
                    )}
                  >
                    <AccordionTrigger className="py-4 hover:no-underline">
                      <div className="flex flex-1 items-center gap-3 pr-3 text-left sm:gap-4">
                        <Logo
                          src={job.logo}
                          name={job.company}
                          className={cn(
                            "h-10 w-10 shrink-0 transition-all duration-300",
                            isOpen && "ring-2 ring-accent/40"
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium text-text-primary">{job.role}</div>
                          <div className="mono truncate text-xs text-text-secondary">
                            {job.company}
                            {hasType ? ` · ${(job as { type?: string }).type}` : ""}
                          </div>
                          <div className="num mt-0.5 text-[11px] text-text-faint sm:hidden">
                            {job.dates}
                          </div>
                        </div>
                        <div className="ml-auto hidden shrink-0 text-right sm:block">
                          <div className="num text-xs text-text-secondary">{job.dates}</div>
                          <div className="mono max-w-[200px] truncate text-[11px] text-text-faint">
                            {job.location}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="sm:pl-[56px]">
                        <p className="text-text-secondary">{job.summary}</p>
                        {bullets.length ? (
                          <ul className="mt-3 space-y-2">
                            {bullets.map((b, bi) => (
                              <li key={bi} className="flex gap-2.5 text-sm text-text-secondary">
                                <span className="mono mt-0.5 shrink-0 text-accent">›</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {job.tech.map((t) => (
                            <span
                              key={t}
                              className="mono rounded border border-border-subtle bg-surface px-1.5 py-0.5 text-[11px] text-text-faint transition-colors hover:border-accent/40 hover:text-text-secondary"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </div>
              );
            })}
          </Accordion>
        </div>
      </Reveal>
    </div>
  );
}
