import { Trophy } from "lucide-react";
import { profile } from "@/data/profile";
import { Reveal } from "./reveal";
import { CountUp } from "./count-up";
import { PortraitCard } from "@/components/ui/portrait-card";

export function About() {
  return (
    <div className="space-y-8">
      {/* narrative + portrait */}
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="font-display text-xl leading-snug text-text-primary sm:text-2xl">
              I work where correctness, performance, and hardware meet — and I like
              it most when the problem is hard enough that the answer has to be
              <span className="text-accent"> measured, not guessed</span>.
            </p>
          </Reveal>
          <Reveal delay={80}>
            <p className="mt-6 leading-relaxed text-text-secondary">
              Today I&apos;m at AMD, building Linux GPU drivers for the{" "}
              <span className="text-text-primary">ROCm</span> platform — the layer that lets
              machine-learning and data-center workloads actually reach the hardware. That&apos;s
              kernel and driver work in C/C++: shipping features for current and next-gen GPUs and
              chasing down the complex issues customers and QA surface.
            </p>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-4 leading-relaxed text-text-secondary">
              Before AMD I made large-scale optimization solvers deterministic and fast at Huawei
              (C++, OpenMP, HPC), researched formal methods and LLM-assisted verification at
              Queen&apos;s, and spent years in embedded — automotive, robotics, and board bring-up.
              The constant: low-level systems where correctness and performance both have to hold.
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-5">
          <Reveal delay={120}>
            <PortraitCard imageUrl={profile.portrait} name={profile.name} subtitle="Toronto, Canada" />
          </Reveal>
        </div>
      </div>

      {/* bento highlights */}
      <Reveal delay={120}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* feature: award */}
          <div className="panel glow-border ticks col-span-2 flex items-center gap-4 p-5">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "var(--accent-2-soft)" }}
            >
              <Trophy className="h-5 w-5" style={{ color: "var(--accent-2)" }} />
            </div>
            <div className="min-w-0">
              <div className="text-gradient font-display text-lg font-semibold leading-tight">
                Global 1st · Huawei ICT
              </div>
              <div className="eyebrow mt-1.5">Cloud Track — Shenzhen, 2024</div>
            </div>
          </div>

          <div className="panel-quiet ticks p-4">
            <div className="text-gradient font-display text-2xl font-semibold">
              <CountUp value={4.3} decimals={1} />
            </div>
            <div className="eyebrow mt-1.5 leading-tight">MASc GPA · /4.3</div>
          </div>

          <div className="panel-quiet ticks p-4">
            <div className="text-gradient font-display text-2xl font-semibold">
              <CountUp value={4000} suffix="+" />
            </div>
            <div className="eyebrow mt-1.5 leading-tight">people reached</div>
          </div>

          <div className="panel-quiet ticks col-span-2 flex items-center gap-4 p-4">
            <div className="text-gradient font-display text-2xl font-semibold">
              <CountUp value={profile.experience.length} />
            </div>
            <div className="eyebrow leading-tight">roles across systems, HPC, ML &amp; embedded</div>
          </div>

          <div className="panel ticks col-span-2 flex items-center gap-2.5 p-4">
            <span className="pulse-dot relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="mono text-xs text-text-secondary">
              open to interesting problems &amp; collaborations
            </span>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
