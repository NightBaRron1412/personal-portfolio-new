"use client";

import { useEffect, useState } from "react";
import { Github, GitCommitHorizontal } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { CountUp } from "./count-up";
import { PanelLabel } from "./panel-label";

type HeatDay = { date: string; count: number; level: number };
type Commit = { sha: string; message: string; repo: string; date: string };
type GitHubData = {
  user: { login: string; avatarUrl: string; publicRepos: number; followers: number };
  recentCommits: Commit[];
  heatmap: HeatDay[];
  includesPrivateContributions: boolean;
  stats: { totalCommits: number; activeDays: number; currentStreak: number; repos: number };
};

const LEVEL_OPACITY = [0, 0.28, 0.5, 0.74, 1];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["", "Mon", "", "Wed", "", "Fri", ""];
const CELL = 13;
const GAP = 3;
const WLW = 26; // weekday label column width

function buildCalendar(days: HeatDay[]) {
  if (!days.length) return { weeks: [] as (HeatDay | null)[][], months: [] as string[] };
  const firstDow = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  const padded: (HeatDay | null)[] = [...Array(firstDow).fill(null), ...days];
  const weeks: (HeatDay | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));

  const months: string[] = [];
  let prev = -1;
  for (const wk of weeks) {
    const real = wk.find(Boolean) as HeatDay | undefined;
    if (real) {
      const m = new Date(`${real.date}T00:00:00Z`).getUTCMonth();
      if (m !== prev) {
        months.push(MONTHS[m]);
        prev = m;
      } else months.push("");
    } else months.push("");
  }
  return { weeks, months };
}

export function GitHubPanel() {
  const [data, setData] = useState<GitHubData | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    let alive = true;
    fetch("/api/github")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json: GitHubData) => {
        if (!alive) return;
        if (!json?.heatmap) return setState("error");
        setData(json);
        setState("ok");
      })
      .catch(() => alive && setState("error"));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="panel ticks p-5 sm:p-6">
      {/* header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Github className="h-4 w-4 text-text-secondary" />
          <PanelLabel>github · contribution graph</PanelLabel>
        </div>
        {data ? (
          <a
            href={`https://github.com/${data.user.login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2"
          >
            {data.user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.user.avatarUrl}
                alt={data.user.login}
                loading="lazy"
                className="h-5 w-5 rounded-full border border-border-subtle"
              />
            ) : null}
            <span className="mono text-xs text-text-secondary transition-colors group-hover:text-accent">
              @{data.user.login}
            </span>
          </a>
        ) : null}
      </div>

      {state === "error" ? (
        <Offline label="github telemetry offline" />
      ) : state === "loading" ? (
        <Skeleton />
      ) : data ? (
        <>
          {/* calendar + stats */}
          <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-start">
            <Calendar days={data.heatmap} includesPrivate={data.includesPrivateContributions} />

            <div className="grid grid-cols-2 gap-3 lg:content-start">
              {[
                { value: data.stats.totalCommits, label: "contributions" },
                { value: data.heatmap.filter((d) => d.count > 0).length, label: "active days" },
                { value: data.stats.currentStreak, label: "day streak" },
                { value: data.stats.repos, label: "public repos" },
              ].map((s) => (
                <div key={s.label} className="panel-quiet ticks relative p-3.5">
                  <div className="text-gradient font-display text-2xl font-semibold">
                    <CountUp value={s.value} />
                  </div>
                  <div className="eyebrow mt-1 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* recent commits */}
          {data.recentCommits.length ? (
            <div className="mt-6 border-t border-border-subtle pt-5">
              <PanelLabel className="mb-3">recent commits</PanelLabel>
              <ul className="space-y-2">
                {data.recentCommits.slice(0, 5).map((c) => (
                  <li key={c.sha} className="flex items-baseline gap-2.5 text-sm">
                    <GitCommitHorizontal className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                    <span className="num shrink-0 text-xs text-text-faint">{c.sha}</span>
                    <span className="min-w-0 flex-1 truncate text-text-secondary">{c.message}</span>
                    <span className="mono hidden shrink-0 text-[11px] text-text-faint sm:inline">
                      {c.date ? formatDistanceToNowStrict(new Date(c.date), { addSuffix: true }) : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function Calendar({ days, includesPrivate }: { days: HeatDay[]; includesPrivate: boolean }) {
  const { weeks, months } = buildCalendar(days);

  return (
    <div className="no-scrollbar min-w-0 overflow-x-auto">
      <div className="inline-flex flex-col">
        {/* month labels */}
        <div className="mb-1 flex" style={{ paddingLeft: WLW, gap: GAP }}>
          {months.map((m, wi) => (
            <div key={wi} className="relative" style={{ width: CELL }}>
              {m ? (
                <span className="mono absolute left-0 top-0 whitespace-nowrap text-[10px] text-text-faint">
                  {m}
                </span>
              ) : null}
            </div>
          ))}
        </div>

        {/* weekday labels + grid */}
        <div className="flex" style={{ gap: GAP }}>
          <div className="flex flex-col justify-between pr-1" style={{ width: WLW, gap: GAP }}>
            {WEEKDAYS.map((d, ri) => (
              <div key={ri} className="flex items-center justify-end" style={{ height: CELL }}>
                <span className="mono text-[9px] leading-none text-text-faint">{d}</span>
              </div>
            ))}
          </div>

          <div className="flex" style={{ gap: GAP }}>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
                {Array.from({ length: 7 }).map((_, ri) => {
                  const day = week[ri];
                  if (!day) {
                    return <div key={ri} style={{ width: CELL, height: CELL }} />;
                  }
                  return (
                    <span
                      key={day.date}
                      title={`${day.count} contribution${day.count === 1 ? "" : "s"} · ${day.date}`}
                      className="heat-cell rounded-[3px] border border-border-subtle transition-transform hover:scale-125"
                      style={{
                        width: CELL,
                        height: CELL,
                        animationDelay: `${wi * 16}ms`,
                        ...(day.level === 0
                          ? { background: "var(--bg-elevated)" }
                          : {
                              background: "var(--accent)",
                              opacity: LEVEL_OPACITY[day.level],
                              borderColor: "transparent",
                            }),
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* legend */}
        <div className="mt-3 flex items-center justify-between" style={{ paddingLeft: WLW }}>
          <span className="eyebrow">
            {includesPrivate ? "incl. private · last ~30 weeks" : "last ~30 weeks"}
          </span>
          <div className="flex items-center gap-1">
            <span className="eyebrow mr-1">less</span>
            {LEVEL_OPACITY.map((op, i) => (
              <span
                key={i}
                className="rounded-[3px] border border-border-subtle"
                style={{
                  width: 11,
                  height: 11,
                  ...(i === 0
                    ? { background: "var(--bg-elevated)" }
                    : { background: "var(--accent)", opacity: op, borderColor: "transparent" }),
                }}
              />
            ))}
            <span className="eyebrow ml-1">more</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Offline({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="mono mb-1 text-text-faint">⚠ no signal</div>
        <p className="eyebrow">{label}</p>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid animate-pulse gap-6 lg:grid-cols-[auto_1fr]">
      <div className="h-32 w-[460px] max-w-full rounded-lg bg-bg-elevated" />
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-bg-elevated" />
        ))}
      </div>
    </div>
  );
}
