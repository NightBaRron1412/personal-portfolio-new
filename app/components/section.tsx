"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";
import { DecoderText } from "./decoder-text";

type SectionProps = {
  id: string;
  index: string;
  title: string;
  /** short mono label shown at the far right of the header rule */
  meta?: string;
  /** narrative one-liner shown under the header */
  lead?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Numbered "datasheet" section: a mono index, a display title, a hairline rule,
 * and an optional narrative lead-in that gives the section a storytelling voice.
 */
export function Section({ id, index, title, meta, lead, children, className }: SectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-16 sm:py-20 lg:py-24", className)}>
      {/* section separator — a faint fading rule for rhythm between sections */}
      <div
        aria-hidden
        className="mb-12 h-px w-full bg-gradient-to-r from-transparent via-border-strong/60 to-transparent sm:mb-16"
      />
      <Reveal>
        <div className="mb-6 flex items-center gap-4">
          <span className="flex shrink-0 items-center gap-2">
            <span aria-hidden className="h-2 w-2 rounded-[1px] bg-accent" />
            <span className="eyebrow num text-accent">{index}</span>
          </span>
          <h2 className="shrink-0 text-gradient">
            <DecoderText text={title} />
          </h2>
          <span aria-hidden className="h-px flex-1 gradient-rule opacity-40" />
          {meta ? (
            <span className="eyebrow hidden shrink-0 sm:inline">{meta}</span>
          ) : null}
        </div>
        {lead ? (
          <p className="mb-10 max-w-2xl text-sm leading-relaxed text-text-secondary sm:mb-12 sm:text-base">
            {lead}
          </p>
        ) : (
          <div className="mb-10 sm:mb-12" />
        )}
      </Reveal>
      {children}
    </section>
  );
}
