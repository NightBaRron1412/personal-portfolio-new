"use client";

import { useRef, useState } from "react";
import { profile } from "@/data/profile";
import { Section } from "./section";
import { Badge } from "./ui/badge";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, ChevronDown, ChevronUp, MapPin, Calendar } from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useMotionPreference } from "../motion-provider";

/* ─── date helpers ─── */
const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function parseEdge(s: string): Date {
  const t = s.trim();
  if (t === "Present") return new Date();
  const [mon, year] = t.split(/\s+/);
  return new Date(parseInt(year, 10), MONTHS[mon] ?? 0, 1);
}

function computeDuration(dates: string): string {
  const parts = dates.split(/\s*[—–-]\s*/);
  if (parts.length < 2) return "";
  const start = parseEdge(parts[0]);
  const end = parseEdge(parts[1]);
  let total = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (total < 1) total = 1;
  const y = Math.floor(total / 12);
  const m = total % 12;
  if (y > 0 && m > 0) return `${y} yr ${m} mos`;
  if (y > 0) return `${y} yr`;
  return `${m} mos`;
}

/* ─── animation variants ─── */
const expandVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: "auto", opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
};

/* ─── single timeline card (with its own useInView) ─── */
function TimelineCard({
  item,
  index,
  enableMotion,
}: {
  item: (typeof profile.experience)[number];
  index: number;
  enableMotion: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const isCurrent = item.dates.includes("Present");
  const duration = computeDuration(item.dates);
  const cardRef = useRef<HTMLDivElement>(null);
  const cardInView = useInView(cardRef, { once: true, margin: "-8%" });

  const fromLeft = index % 2 === 0;

  return (
    <motion.div
      ref={cardRef}
      className="group relative"
      initial={enableMotion ? {
        opacity: 0,
        x: fromLeft ? -60 : 60,
        y: 20,
        scale: 0.93,
        rotate: fromLeft ? -3 : 3,
      } : false}
      animate={enableMotion && cardInView ? {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
      } : {}}
      transition={{
        type: "spring",
        stiffness: 160,
        damping: 20,
        mass: 0.8,
      }}
    >
      <div
        className={`
          relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-elevated p-5 shadow-soft
          transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5 cursor-pointer
          ${expanded ? "ring-1 ring-accent-blue/30" : ""}
        `}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => e.key === "Enter" && setExpanded((v) => !v)}
        tabIndex={0}
        role="button"
        aria-expanded={expanded}
        aria-label={`${item.role} at ${item.company}`}
      >
        {/* Gradient accent stripe */}
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-accent-blue via-accent-pink to-accent-purple opacity-60" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 pl-3">
          <div className="flex items-start gap-3 min-w-0">
            {(item as any).logo && (
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-bg-main/50 p-1.5">
                <Image
                  src={(item as any).logo}
                  alt={`${item.company} logo`}
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-text-primary leading-tight">
                  {item.role}
                </h3>
                {isCurrent && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 ring-1 ring-inset ring-emerald-500/25">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Current
                  </span>
                )}
              </div>
              <div className="mt-0.5">
                {(item as any).companyUrl ? (
                  <Link
                    href={(item as any).companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-accent-blue hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.company}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                ) : (
                  <span className="text-sm font-medium text-text-secondary">{item.company}</span>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" suppressHydrationWarning />
                  {item.dates}
                  {duration && <span className="text-text-secondary/60">· {duration}</span>}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" suppressHydrationWarning />
                  {item.location}
                </span>
              </div>
            </div>
          </div>
          <button
            className="mt-1 shrink-0 rounded-lg p-1 text-text-secondary transition hover:bg-bg-main/50 hover:text-text-primary"
            aria-label={expanded ? "Collapse" : "Expand"}
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          >
            {expanded
              ? <ChevronUp className="h-4 w-4" suppressHydrationWarning />
              : <ChevronDown className="h-4 w-4" suppressHydrationWarning />
            }
          </button>
        </div>

        {/* Summary always visible */}
        <p className="mt-3 pl-3 text-sm text-text-secondary leading-relaxed">{item.summary}</p>

        {/* Expandable detail */}
        <AnimatePresence initial={false}>
          {expanded && (
            !enableMotion ? (
              <div key="detail" className="overflow-hidden">
                <div className="mt-4 space-y-3 pl-3">
                  <ul className="space-y-2 text-sm text-text-primary/80">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-pink" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    {item.tech.map((tech) => (
                      <Badge key={tech} className="text-xs">{tech}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <motion.div
                key="detail"
                variants={expandVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-3 pl-3">
                  <ul className="space-y-2 text-sm text-text-primary/80">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-pink" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    {item.tech.map((tech) => (
                      <Badge key={tech} className="text-xs">{tech}</Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ─── timeline dot that animates when its card is in view ─── */
function TimelineDot({ index, enableMotion }: { index: number; enableMotion: boolean }) {
  const dotRef = useRef<HTMLDivElement>(null);
  const dotInView = useInView(dotRef, { once: true, margin: "-10%" });

  return (
    <div ref={dotRef} className="absolute -left-12 top-1/2 -translate-y-1/2 hidden md:flex items-center" aria-hidden>
      <motion.span
        className="block h-[14px] w-[14px] rounded-full border-[3px] border-accent-blue bg-bg-main relative z-10"
        initial={enableMotion ? { scale: 0, opacity: 0 } : false}
        animate={enableMotion && dotInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
      />
      <motion.span
        className="block h-0.5 w-[34px] bg-gradient-to-r from-accent-blue to-border-subtle origin-left"
        initial={enableMotion ? { scaleX: 0 } : false}
        animate={enableMotion && dotInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
      />
    </div>
  );
}

/* ─── main component ─── */
export function Experience() {
  const { hydrated, motionEnabled } = useMotionPreference();
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInView = useInView(timelineRef, { once: true, margin: "-5%" });
  const enableMotion = hydrated && motionEnabled;

  return (
    <Section id="experience" className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-text-secondary">Experience</p>
        <h2>Impactful roles</h2>
      </div>

      {/* Timeline */}
      <div ref={timelineRef} className="relative">
        {/* Self-drawing vertical timeline — desktop only */}
        <div className="absolute left-[6px] top-0 bottom-0 hidden w-0.5 md:block" aria-hidden>
          <div className="h-full w-full bg-border-subtle/30" />
          <motion.div
            className="absolute inset-0 w-full bg-gradient-to-b from-accent-blue via-accent-purple to-accent-pink origin-top"
            initial={enableMotion ? { scaleY: 0 } : false}
            animate={enableMotion && timelineInView ? { scaleY: 1 } : {}}
            transition={{ duration: 2.0, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <div className="space-y-6 md:pl-12">
          {profile.experience.map((item, index) => (
            <div key={`${item.company}-${index}`} className="relative">
              <TimelineDot index={index} enableMotion={enableMotion} />
              <TimelineCard
                item={item}
                index={index}
                enableMotion={enableMotion}
              />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
