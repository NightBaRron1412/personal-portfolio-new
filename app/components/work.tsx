"use client";

import { ArrowUpRight, Github } from "lucide-react";
import { profile } from "@/data/profile";
import { Reveal } from "./reveal";
import { CountUp } from "./count-up";
import { PanelLabel } from "./panel-label";
import { Sweep } from "./sweep";
import { TiltSpotlight } from "./tilt-spotlight";
import { BorderBeam } from "@/components/ui/border-beam";

type Metric = {
  value?: number;
  static?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
};

const METRICS: Record<string, Metric[]> = {
  "OptVerse: Deterministic Sparse Linear Solver": [
    { static: "bit-exact", label: "run-to-run reproducible" },
    { static: "C++ / OpenMP", label: "parallel HPC" },
    { static: "Mittelmann", label: "benchmark-validated" },
  ],
  "DeepParse: LLM-Enhanced Log Parsing Framework": [
    { value: 97.6, decimals: 1, suffix: "%", label: "parse accuracy" },
    { value: 16, label: "datasets" },
    { static: "DeepSeek-R1", label: "+ Drain hybrid" },
  ],
  "VehiPlus: Embedded Telematics & Driver Assistance Platform": [
    { value: 100, prefix: "<", suffix: "ms", label: "alert latency" },
    { static: "RPi 4", label: "edge inference" },
    { static: "OTA", label: "update framework" },
  ],
};

// Per-project accent so the cards read as distinct (teal · violet · fuchsia).
const PROJECT_ACCENTS = ["var(--accent)", "var(--accent-2)", "#d946ef"];

export function Work() {
  return (
    <div className="space-y-5">
      {profile.projects.map((project, i) => {
        const metrics = METRICS[project.title] ?? [];
        const color = PROJECT_ACCENTS[i % PROJECT_ACCENTS.length];
        return (
          <Reveal key={project.title} delay={i * 80}>
            <TiltSpotlight className="panel ticks p-6 sm:p-8">
              {/* per-project accent glow — gives each card its own identity */}
              <div
                aria-hidden
                className="pointer-events-none absolute right-5 top-5 h-24 w-24 rounded-full opacity-[0.12] blur-2xl"
                style={{ background: color }}
              />
              <BorderBeam duration={8} delay={i * 4} size={70} />
              <BorderBeam duration={8} delay={i * 4 + 4} size={70} reverse />
              {/* header */}
              <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="eyebrow" style={{ color }}>
                      P-{String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="mono rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider"
                      style={{
                        borderColor: color,
                        background: `color-mix(in srgb, ${color} 14%, transparent)`,
                        color,
                      }}
                    >
                      featured
                    </span>
                  </div>
                  <h3 className="mt-2 text-xl sm:text-2xl">{project.title}</h3>
                  <p className="eyebrow mt-1.5">{project.role}</p>
                </div>
                <div className="flex gap-2">
                  {project.repo ? (
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Repository"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-secondary transition-colors hover:border-accent hover:text-accent"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  ) : null}
                  {project.demo ? (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border-subtle px-3 text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent"
                    >
                      Demo <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </div>
              </div>

              <p className="mt-5 max-w-3xl leading-relaxed text-text-secondary">
                {project.description}
              </p>

              {/* metrics */}
              {metrics.length ? (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {metrics.map((m) => (
                    <div key={m.label} className="panel-quiet p-3.5">
                      <div className="text-gradient font-display text-xl font-semibold">
                        {m.static ? (
                          <span className="mono text-base">{m.static}</span>
                        ) : (
                          <CountUp
                            value={m.value ?? 0}
                            decimals={m.decimals ?? 0}
                            prefix={m.prefix}
                            suffix={m.suffix}
                          />
                        )}
                      </div>
                      <Sweep className="mt-2 w-8" />
                      <div className="eyebrow mt-1.5 leading-tight">{m.label}</div>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* problem / approach / result */}
              {project.details ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {(
                    [
                      ["problem", project.details.problem],
                      ["approach", project.details.approach],
                      ["result", project.details.results],
                    ] as const
                  ).map(([label, body]) => (
                    <div key={label} className="border-t border-border-subtle pt-3">
                      <PanelLabel className="mb-2">{label}</PanelLabel>
                      <p className="text-sm leading-relaxed text-text-secondary">{body}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* tech */}
              <div className="mt-6 flex flex-wrap gap-1.5">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="mono rounded-md border border-border-subtle bg-surface px-2 py-1 text-xs text-text-secondary"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </TiltSpotlight>
          </Reveal>
        );
      })}

      <Reveal className="!mt-10">
        <div className="flex flex-col gap-3 border-t border-border-subtle pt-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <PanelLabel>project archive</PanelLabel>
            <h3 className="mt-2 text-2xl sm:text-3xl">More things I&apos;ve built</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
              Products, research tools, embedded systems, and experiments beyond the featured case
              studies.
            </p>
          </div>
          <a
            href={profile.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="mono inline-flex w-fit items-center gap-1.5 text-xs uppercase tracking-wider text-text-secondary transition-colors hover:text-accent"
          >
            All repositories <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-2">
        {profile.otherProjects.map((project, i) => {
          const color = PROJECT_ACCENTS[(i + profile.projects.length) % PROJECT_ACCENTS.length];
          return (
            <Reveal key={project.title} delay={(i % 2) * 70}>
              <article className="panel group relative flex h-full flex-col overflow-hidden p-5 transition-transform duration-300 hover:-translate-y-1 sm:p-6">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[0.08] blur-2xl transition-opacity duration-300 group-hover:opacity-[0.16]"
                  style={{ background: color }}
                />

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <span className="eyebrow" style={{ color }}>
                      A-{String(i + 1).padStart(2, "0")}
                    </span>
                    <h4 className="mt-2 text-lg sm:text-xl">{project.title}</h4>
                    <p className="eyebrow mt-1.5">{project.category}</p>
                  </div>
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.title} repository`}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border-subtle text-text-secondary transition-colors hover:border-accent hover:text-accent"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                </div>

                <p className="relative mt-4 flex-1 text-sm leading-relaxed text-text-secondary">
                  {project.description}
                </p>

                <div className="relative mt-5 flex flex-wrap gap-1.5">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="mono rounded-md border border-border-subtle bg-surface px-2 py-1 text-[11px] text-text-secondary"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {project.demo ? (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono relative mt-5 inline-flex w-fit items-center gap-1.5 text-xs uppercase tracking-wider text-text-secondary transition-colors hover:text-accent"
                  >
                    Open project <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </article>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
