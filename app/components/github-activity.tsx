"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import { GitCommit, Flame, Calendar, FolderGit2, ExternalLink } from "lucide-react";
import { Section } from "./section";
import { AnimatedNumber } from "./animated-number";
import { useMotionPreference } from "../motion-provider";

interface GitHubData {
  user: {
    login: string;
    avatarUrl: string;
    publicRepos: number;
    followers: number;
  };
  recentCommits: {
    sha: string;
    message: string;
    repo: string;
    date: string;
  }[];
  heatmap: { date: string; count: number; level: number }[];
  includesPrivateContributions?: boolean;
  stats: {
    totalCommits: number;
    activeDays: number;
    currentStreak: number;
    repos: number;
  };
}

const LEVEL_COLORS = [
  "bg-gray-200/50 dark:bg-white/[0.06]",
  "bg-emerald-400/40 dark:bg-emerald-400/25",
  "bg-emerald-500/60 dark:bg-emerald-400/45",
  "bg-emerald-600/80 dark:bg-emerald-400/70",
  "bg-emerald-700 dark:bg-emerald-400/95",
];

function parseDateKeyUTC(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00Z`);
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
}

export function GitHubActivity() {
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"heatmap" | "commits">("heatmap");
  const [snakeHead, setSnakeHead] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const { hydrated, motionEnabled } = useMotionPreference();
  const enableMotion = hydrated && motionEnabled;

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/github");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch GitHub data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const weeks = useMemo(() => {
    if (!data?.heatmap) return [];
    const result: { date: string; count: number; level: number }[][] = [];
    let currentWeek: { date: string; count: number; level: number }[] = [];

    // Pad start to align with Monday
    const firstDate = parseDateKeyUTC(data.heatmap[0].date);
    const startDay = (firstDate.getUTCDay() + 6) % 7;
    for (let i = 0; i < startDay; i++) {
      currentWeek.push({ date: "", count: -1, level: -1 });
    }

    for (const day of data.heatmap) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      // Pad end to complete the week
      while (currentWeek.length < 7) {
        currentWeek.push({ date: "", count: -1, level: -1 });
      }
      result.push(currentWeek);
    }
    return result;
  }, [data?.heatmap]);

  const monthLabels = useMemo(() => {
    if (!data?.heatmap || weeks.length === 0) return [];
    const labels: { month: string; colIndex: number }[] = [];
    let currentMonth = "";

    weeks.forEach((week, weekIndex) => {
      const firstValidDay = week.find((d) => d.date !== "");
      if (firstValidDay) {
        const date = parseDateKeyUTC(firstValidDay.date);
        const monthName = date.toLocaleString("en", { month: "short", timeZone: "UTC" });
        if (monthName !== currentMonth) {
          currentMonth = monthName;
          labels.push({ month: monthName, colIndex: weekIndex });
        }
      }
    });
    return labels;
  }, [weeks, data?.heatmap]);

  const snakePath = useMemo(() => {
    const path: { wi: number; di: number }[] = [];
    weeks.forEach((week, wi) => {
      const dayIndices = wi % 2 === 0 ? [0, 1, 2, 3, 4, 5, 6] : [6, 5, 4, 3, 2, 1, 0];
      dayIndices.forEach((di) => {
        if (week[di]?.level !== -1) {
          path.push({ wi, di });
        }
      });
    });
    return path;
  }, [weeks]);

  const snakePathIndex = useMemo(() => {
    const map = new Map<string, number>();
    snakePath.forEach((pos, idx) => {
      map.set(`${pos.wi}-${pos.di}`, idx);
    });
    return map;
  }, [snakePath]);

  useEffect(() => {
    if (!enableMotion || activeTab !== "heatmap" || snakePath.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setSnakeHead((prev) => (prev + 1) % snakePath.length);
    }, 120);

    return () => clearInterval(interval);
  }, [activeTab, enableMotion, snakePath.length]);

  const statItems = useMemo(() => {
    if (!data?.stats) return [];
    return [
      { icon: GitCommit, label: "Commits", value: data.stats.totalCommits, suffix: "", color: "text-emerald-400" },
      { icon: Flame, label: "Streak", value: data.stats.currentStreak, suffix: "d", color: "text-orange-400" },
      { icon: Calendar, label: "Active Days", value: data.stats.activeDays, suffix: "", color: "text-blue-400" },
      { icon: FolderGit2, label: "Repos", value: data.stats.repos, suffix: "", color: "text-purple-400" },
    ];
  }, [data?.stats]);

  if (loading) {
    return (
      <Section id="github" className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-text-secondary">GitHub Activity</p>
        </div>
        <div className="section-card p-6">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-text-secondary">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
              <span className="text-sm">Loading GitHub activity...</span>
            </div>
          </div>
        </div>
      </Section>
    );
  }

  if (!data) {
    return (
      <Section id="github" className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-text-secondary">GitHub Activity</p>
          <h2>Contribution Tracker</h2>
        </div>
        <div className="section-card p-6">
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-text-secondary">
              Unable to load GitHub data. Check browser console for details.
            </p>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section id="github" className="relative z-10 space-y-6">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-text-secondary">GitHub Activity</p>
        <h2>Contribution Tracker</h2>
      </div>

      {/* Stats Row */}
      <motion.div
        ref={ref}
        className="relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-4"
        initial={!enableMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {statItems.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="section-card flex items-center gap-3 p-4 transition-transform hover:-translate-y-0.5"
            initial={!enableMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <div className={`rounded-lg bg-bg-elevated p-2 ${stat.color}`}>
              <stat.icon className="h-4 w-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-text-primary">
                <AnimatedNumber value={Number(stat.value)} />
                {stat.suffix}
              </div>
              <div className="text-xs text-text-secondary">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Card */}
      <motion.div
        className="relative z-10 section-card overflow-hidden"
        initial={!enableMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Tab Switcher */}
        <div className="flex items-center justify-between border-b border-border-subtle px-5 pt-4 pb-0">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("heatmap")}
              className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "heatmap"
                  ? "bg-bg-elevated text-emerald-400 border-b-2 border-emerald-400"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Heatmap
            </button>
            <button
              onClick={() => setActiveTab("commits")}
              className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "commits"
                  ? "bg-bg-elevated text-emerald-400 border-b-2 border-emerald-400"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Recent Commits
            </button>
          </div>
          <a
            href="https://github.com/NightBaRron1412"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
          >
            @NightBaRron1412
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="p-5">
          {activeTab === "heatmap" ? (
            <div className="space-y-4">
              {/* Heatmap Grid */}
              <div className="overflow-hidden pb-2">
                <div className="flex flex-col gap-2">
                  {/* Month labels */}
                  <div className="flex gap-1.5">
                    <div className="w-9 shrink-0" /> {/* Spacer for day labels */}
                    <div className="relative flex flex-1">
                      {monthLabels.map((label, idx) => (
                        <div
                          key={idx}
                          className="absolute text-[9px] font-medium text-text-secondary"
                          style={{
                            left: `calc(${(label.colIndex * 100) / weeks.length}%)`,
                          }}
                        >
                          {label.month}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Grid with day labels */}
                  <div className="flex gap-1.5">
                    {/* Day labels */}
                    <div className="grid w-9 shrink-0 grid-rows-7 gap-[2px] text-[9px] leading-none text-text-secondary">
                      <div className="flex items-center">Mon</div>
                      <div className="flex items-center">Tue</div>
                      <div className="flex items-center">Wed</div>
                      <div className="flex items-center">Thu</div>
                      <div className="flex items-center">Fri</div>
                      <div className="flex items-center">Sat</div>
                      <div className="flex items-center">Sun</div>
                    </div>
                    {/* Grid */}
                    <div className="flex min-w-0 flex-1 gap-[2px]">
                      {weeks.map((week, wi) => (
                        <div key={wi} className="flex min-w-0 flex-1 flex-col gap-[2px]">
                          {week.map((day, di) => (
                            (() => {
                              const cellKey = `${wi}-${di}`;
                              const pathIndex = snakePathIndex.get(cellKey);
                              const snakeLength = 7;
                              const trailOffset =
                                pathIndex === undefined || snakePath.length === 0
                                  ? snakeLength
                                  : (snakeHead - pathIndex + snakePath.length) % snakePath.length;
                              const trailStrength =
                                trailOffset < snakeLength
                                  ? 1 - trailOffset / snakeLength
                                  : 0;

                              return (
                                <motion.div
                                  key={cellKey}
                                  className={`aspect-square w-full rounded-[2px] ${
                                    day.level === -1
                                      ? "bg-transparent"
                                      : `cursor-pointer ${LEVEL_COLORS[day.level]}`
                                  }`}
                                  title={
                                    day.level === -1
                                      ? ""
                                      : `${day.date}: ${day.count} contribution${day.count !== 1 ? "s" : ""}`
                                  }
                                  animate={
                                    !enableMotion || day.level === -1
                                      ? undefined
                                      : {
                                          scale: 1 + trailStrength * 0.22,
                                          y: -trailStrength * 1.25,
                                          boxShadow:
                                            trailStrength > 0
                                              ? `0 0 ${8 + trailStrength * 14}px rgba(52,211,153,${0.15 + trailStrength * 0.4})`
                                              : "0 0 0 rgba(0,0,0,0)",
                                          filter: `brightness(${1 + trailStrength * 0.45})`,
                                        }
                                  }
                                  whileHover={
                                    !enableMotion || day.level === -1
                                      ? undefined
                                      : { scale: 1.2, y: -1, boxShadow: "0 0 0 1px rgba(52,211,153,0.6)" }
                                  }
                                  transition={{
                                    type: "spring",
                                    stiffness: 420,
                                    damping: 26,
                                    mass: 0.2,
                                  }}
                                />
                              );
                            })()
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-2 text-xs text-text-secondary sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>{data.stats.totalCommits} contributions</span>
                  <span className="opacity-50">•</span>
                  <span>{data.stats.activeDays} days</span>
                  {data.includesPrivateContributions && (
                    <span className="text-[10px] opacity-60">
                      (includes private contributions)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px]">Less</span>
                  {LEVEL_COLORS.map((color, i) => (
                    <div
                      key={i}
                      className={`h-2.5 w-2.5 rounded-sm ${color}`}
                    />
                  ))}
                  <span className="text-[10px]">More</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {data.recentCommits.map((commit, i) => (
                <motion.div
                  key={`${commit.sha}-${i}`}
                  className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-bg-elevated"
                  initial={!enableMotion ? false : { opacity: 0, x: -12 }}
                  animate={!enableMotion ? {} : { opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                    <GitCommit className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {commit.message}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-text-secondary">
                      <span className="rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px]">
                        {commit.sha}
                      </span>
                      <span className="truncate">{commit.repo}</span>
                      <span className="shrink-0">· {timeAgo(commit.date)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {data.recentCommits.length === 0 && (
                <p className="py-8 text-center text-sm text-text-secondary">
                  No recent public commits found.
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </Section>
  );
}
