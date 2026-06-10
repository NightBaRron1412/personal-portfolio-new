"use client";

import { cloneElement, useEffect, useRef, useState } from "react";
import { Github, GitCommitHorizontal } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { useTheme } from "next-themes";
import { ActivityCalendar, type ThemeInput } from "react-activity-calendar";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { CountUp } from "./count-up";
import { PanelLabel } from "./panel-label";
import { Sweep } from "./sweep";

type HeatDay = { date: string; count: number; level: number };
type Commit = { sha: string; message: string; repo: string; date: string };
type GitHubData = {
  user: { login: string; avatarUrl: string; publicRepos: number; followers: number };
  recentCommits: Commit[];
  heatmap: HeatDay[];
  includesPrivateContributions: boolean;
  stats: { totalCommits: number; activeDays: number; currentStreak: number; repos: number };
};

// Teal ramp matching the design system (5 stops: level 0 → 4).
const CAL_THEME: ThemeInput = {
  light: ["#e8edf1", "#b5ece3", "#6fd3c5", "#23a594", "#0d9488"],
  dark: ["#1a2230", "#134e48", "#15786e", "#1ba89a", "#2dd4bf"],
};

export function GitHubPanel() {
  const { resolvedTheme } = useTheme();
  const [data, setData] = useState<GitHubData | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const wrapRef = useRef<HTMLDivElement>(null);
  // Responsive sizing so the 6 months fit any width (no horizontal cut).
  const [block, setBlock] = useState({ size: 11, margin: 3 });
  // On narrow screens the footer text (total + legend) is the width constraint,
  // not the squares — so shorten the label and drop the legend there.
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    if (state !== "ok") return;
    const el = wrapRef.current;
    if (!el) return;
    const WEEKS = 27; // ~6 months of columns
    const measure = () => {
      setNarrow(window.innerWidth < 560);
      // Desktop: two-column dashboard — fixed, comfortable squares (the right
      // column soaks up the remaining width, so the calendar needn't stretch).
      if (window.innerWidth >= 1024) {
        setBlock({ size: 15, margin: 3 });
        return;
      }
      // Stacked (tablet/mobile): scale squares so the 6 months fill the width.
      const w = el.clientWidth;
      if (!w) return;
      const margin = 2;
      const size = Math.max(4, Math.min(15, Math.floor((w - 28) / WEEKS) - margin));
      setBlock({ size, margin });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [state]);

  useEffect(() => {
    let alive = true;
    fetch("/api/github")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json: GitHubData) => {
        if (!alive) return;
        if (!json?.heatmap?.length) return setState("error");
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
                decoding="async"
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
          {/* dashboard: calendar (left) + stats (right) on desktop so the full
              width is used; stacked on tablet/mobile. */}
          <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-start">
            {/* 6-month contribution calendar */}
            <div ref={wrapRef} className="no-scrollbar overflow-x-auto pb-1">
              <div className="mx-auto w-fit lg:mx-0">
                <ActivityCalendar
                  data={data.heatmap}
                  theme={CAL_THEME}
                  colorScheme={resolvedTheme === "light" ? "light" : "dark"}
                  blockSize={block.size}
                  blockMargin={block.margin}
                  blockRadius={block.size >= 10 ? 2 : 1}
                  fontSize={12}
                  showColorLegend={!narrow}
                  labels={{
                    totalCount: narrow
                      ? "{{count}} contributions"
                      : `{{count}} contributions in the last 6 months${
                          data.includesPrivateContributions ? " · incl. private" : ""
                        }`,
                  }}
                  renderBlock={(b, activity) =>
                    cloneElement(b, {
                      "data-tooltip-id": "gh-cal-tip",
                      "data-tooltip-content": `${activity.count} contribution${
                        activity.count === 1 ? "" : "s"
                      } on ${activity.date}`,
                    })
                  }
                  style={{ color: "var(--text-faint)" }}
                />
              </div>
              <ReactTooltip
                id="gh-cal-tip"
                className="!rounded-md !bg-bg-elevated !text-text-primary"
              />
            </div>

            {/* stats — fills the remaining width on desktop, 4-up when stacked */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 lg:content-start">
              {[
                { value: data.stats.totalCommits, label: "contributions" },
                { value: data.heatmap.filter((d) => d.count > 0).length, label: "active days" },
                { value: data.stats.currentStreak, label: "day streak" },
                { value: data.stats.repos, label: "public repos" },
              ].map((s) => (
                <div key={s.label} className="panel-quiet ticks relative p-4">
                  <div className="text-gradient font-display text-2xl font-semibold">
                    <CountUp value={s.value} />
                  </div>
                  <Sweep className="mt-2 w-8" />
                  <div className="eyebrow mt-1.5 leading-tight">{s.label}</div>
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
    <div className="animate-pulse space-y-5">
      <div className="h-28 w-full rounded-lg bg-bg-elevated" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-bg-elevated" />
        ))}
      </div>
    </div>
  );
}
