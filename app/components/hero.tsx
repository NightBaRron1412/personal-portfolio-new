"use client";

import { motion, type Variants } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  Briefcase,
  Layers,
  Crosshair,
  MapPin,
  Clock as ClockIcon,
  type LucideIcon,
} from "lucide-react";
import { profile } from "@/data/profile";
import { scrollToId } from "@/lib/utils";
import { Clock } from "./clock";
import { PanelLabel } from "./panel-label";
import { Magnetic } from "./magnetic";
import { Typewriter } from "./typewriter";
import { DecoderText } from "./decoder-text";
import { SignalBars } from "./signal-bars";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ShinyButton } from "@/components/ui/shiny-button";

const TYPED = [
  "developing GPU drivers for ROCm at AMD",
  "making parallel solvers reproducible",
  "teaching systems to parse their own logs",
  "from embedded benches to data-center GPUs",
  "happiest one layer below the surface",
];

const STATUS_ROWS: { label: string; icon: LucideIcon; value: React.ReactNode }[] = [
  { label: "ROLE", icon: Briefcase, value: "Sr. Software Engineer · AMD" },
  { label: "STACK", icon: Layers, value: "ROCm · Linux kernel · C/C++" },
  { label: "FOCUS", icon: Crosshair, value: "Systems · HPC · ML · formal methods" },
  { label: "LOCATION", icon: MapPin, value: profile.location },
  { label: "LOCAL", icon: ClockIcon, value: <Clock /> },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.075, delayChildren: 0.05 } },
};

// Note: no opacity/blur in the hidden state — that would SSR the hero at
// opacity:0 and delay LCP until JS animates it in. A pure y-slide keeps the
// content painted at first paint (good LCP) while still feeling alive.
const item: Variants = {
  hidden: { y: 14 },
  show: {
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Hero() {
  return (
    <section id="home" className="relative scroll-mt-24 pt-28 sm:pt-32 lg:pt-40">
      <div className="relative z-10 grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Left — masthead */}
        <motion.div
          className="min-w-0 lg:col-span-7"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.p variants={item} className="eyebrow flex items-center gap-2">
            <span className="pulse-dot relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            senior software engineer — amd rocm
          </motion.p>

          <motion.div variants={item}>
            <h1 className="mt-5 text-gradient">
              <DecoderText text="Amir Shetaia" />
            </h1>
            <span
              aria-hidden
              className="underline-grow mt-4 block h-1 w-24 rounded-full"
              style={{ background: "var(--gradient)" }}
            />
          </motion.div>

          <motion.div variants={item} className="mt-6 max-w-2xl">
            <TextGenerateEffect
              className="font-display text-xl leading-snug text-text-primary sm:text-2xl"
              segments={[
                { text: "I build the layers most software never sees —" },
                { text: "GPU drivers,", accent: true },
                { text: "deterministic" },
                { text: "solvers,", accent: true },
                { text: "and the systems underneath." },
              ]}
            />
          </motion.div>

          <motion.p
            variants={item}
            className="mt-5 max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base"
          >
            {profile.hero.bio}
          </motion.p>

          <motion.div variants={item} className="mt-7">
            <div className="inline-flex max-w-full items-center gap-2 overflow-hidden rounded-lg border border-border-subtle bg-surface px-3 py-2">
              <span className="mono shrink-0 text-sm text-accent">amir@now:~$</span>
              <Typewriter words={TYPED} className="mono truncate text-sm text-text-secondary" />
            </div>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-7 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1.5"
          >
            <span className="pulse-dot relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="mono text-xs text-accent">open to interesting problems &amp; collaborations</span>
          </motion.div>

          <motion.div variants={item} className="mt-7 flex flex-wrap items-center gap-3">
            <Magnetic>
              <ShinyButton onClick={() => scrollToId("contact")} className="h-11">
                Get in touch
              </ShinyButton>
            </Magnetic>
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-border-subtle px-5 text-sm font-medium text-text-primary transition-colors hover:border-accent hover:text-accent"
            >
              Résumé <ArrowUpRight className="h-4 w-4" />
            </a>
            <div className="ml-1 flex items-center gap-1">
              <IconLink href={profile.social.github} label="GitHub">
                <Github className="h-[18px] w-[18px]" />
              </IconLink>
              <IconLink href={profile.social.linkedin} label="LinkedIn">
                <Linkedin className="h-[18px] w-[18px]" />
              </IconLink>
              <IconLink href={profile.social.email} label="Email">
                <Mail className="h-[18px] w-[18px]" />
              </IconLink>
            </div>
          </motion.div>
        </motion.div>

        {/* Right — status instrument */}
        <motion.div
          className="min-w-0 lg:col-span-5"
          initial={{ x: 18 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <div className="panel ticks relative overflow-hidden p-5 sm:p-6">
            {/* soft corner glow for depth (static, cheap) */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-25 blur-2xl"
              style={{ background: "var(--gradient)" }}
            />
            {/* header */}
            <div className="relative flex items-center justify-between">
              <PanelLabel>system status</PanelLabel>
              <span className="mono inline-flex items-center gap-1.5 text-[11px] tracking-wide text-accent">
                <span className="pulse-dot relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                LIVE
              </span>
            </div>
            {/* live signal — the eye-catching centerpiece */}
            <SignalBars className="relative mt-3" />
            {/* metric rows with iconography tiles */}
            <dl className="relative mt-2 space-y-0.5">
              {STATUS_ROWS.map((row, i) => {
                const Icon = row.icon;
                return (
                  <motion.div
                    key={row.label}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="group/row -mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface/70"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-accent-soft text-accent transition-colors group-hover/row:border-accent/50">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <dt className="eyebrow shrink-0">{row.label}</dt>
                    <dd className="num ml-auto text-right text-xs text-text-primary transition-colors group-hover/row:text-accent sm:text-[13px]">
                      {row.value}
                    </dd>
                  </motion.div>
                );
              })}
            </dl>
            {/* now */}
            <div className="relative mt-4 overflow-hidden rounded-lg border border-border-subtle bg-surface p-3 pl-4">
              <span aria-hidden className="absolute inset-y-0 left-0 w-0.5" style={{ background: "var(--gradient)" }} />
              <PanelLabel className="mb-1.5">now</PanelLabel>
              <p className="text-xs leading-relaxed text-text-secondary">{profile.hero.now}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.button
        onClick={() => scrollToId("about")}
        className="relative z-10 mt-16 inline-flex items-center gap-2 text-text-faint transition-colors hover:text-accent"
        aria-label="Scroll to about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <span className="eyebrow">scroll</span>
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </motion.button>
    </section>
  );
}

function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const external = href.startsWith("http");
  return (
    <Magnetic>
      <a
        href={href}
        aria-label={label}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-elevated hover:text-accent"
      >
        {children}
      </a>
    </Magnetic>
  );
}
