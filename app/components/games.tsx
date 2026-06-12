"use client";

import { ArrowUpRight, Gamepad2 } from "lucide-react";
import GAMES from "@/data/games.json";
import META from "@/data/games.meta.json";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

type Meta = {
  appid: string | null;
  cover: string | null;
  wide?: boolean;
  year: string | null;
  genres: string[];
  url: string | null;
};

const meta = META as unknown as Record<string, Meta>;
const PLATFORMS = [...new Set(GAMES.flatMap((g) => g.platforms))];
const nowPlaying = GAMES.find((g) => /playing/i.test(g.status ?? ""));

function HudStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <span className="mono text-[11px]">
      <span className="uppercase tracking-wide text-text-faint">{label} </span>
      <span className={accent ? "font-semibold text-text-primary" : "text-text-primary"}>{value}</span>
    </span>
  );
}

function Cover({ m, title }: { m: Meta; title: string }) {
  if (!m.cover) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center p-3 text-center"
        style={{ background: "var(--gradient)" }}
      >
        <span className="font-display text-base font-semibold text-text-on-accent">{title}</span>
      </div>
    );
  }
  if (m.wide) {
    // landscape header → full art on a blurred fill so it reads as a cover
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={m.cover}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-55 blur-xl"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={m.cover}
          alt={`${title} cover`}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 m-auto h-auto w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={m.cover}
      alt={`${title} cover`}
      loading="eager"
      fetchPriority="high"
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
}

/**
 * "Off the Clock" — a console-style game shelf. Player-profile HUD + ranked
 * cover cards (status badges, now-playing pulse, selection glow on hover,
 * store prompt). Covers/metadata come from Steam at build time (gen-games.mjs).
 */
export function Games() {
  return (
    <div className="space-y-5">
      {/* player HUD */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-border-subtle bg-surface px-4 py-3">
        <span className="mono inline-flex items-center gap-2 text-xs font-medium text-text-primary">
          <Gamepad2 className="h-4 w-4 text-accent" /> PLAYER · NightBaRron1412
        </span>
        <HudStat label="library" value={`${GAMES.length} titles`} />
        <HudStat label="genre" value="story-driven AAA" />
        <HudStat label="platforms" value={PLATFORMS.slice(0, 3).join(" · ")} />
        {nowPlaying ? <HudStat label="now playing" value={nowPlaying.title} accent /> : null}
      </div>

      {/* shelf */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {GAMES.map((g, i) => {
          const m = meta[g.slug] ?? ({} as Meta);
          const playing = /playing/i.test(g.status ?? "");
          const detail = [m.year, ...(m.genres ?? [])].filter(Boolean).join(" · ");
          return (
            <Reveal key={g.slug} delay={(i % 6) * 55}>
              <a
                href={m.url ?? undefined}
                target={m.url ? "_blank" : undefined}
                rel="noopener noreferrer"
                className={cn(
                  "group relative block aspect-[2/3] overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated transition-all duration-300 hover:-translate-y-1.5 hover:border-accent hover:shadow-glow hover:ring-2 hover:ring-accent/50",
                  playing && "border-accent/40 shadow-glow ring-1 ring-accent/30"
                )}
              >
                <Cover m={m} title={g.title} />

                {/* hover sheen sweep */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-[160%] skew-x-[-16deg] bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:[animation:gameSheen_0.75s_ease-out]"
                />

                {/* rank */}
                <span className="num pointer-events-none absolute right-1.5 top-0.5 z-10 text-2xl font-bold text-white/20 mix-blend-overlay">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* status */}
                {g.status ? (
                  <span
                    className={cn(
                      "absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide backdrop-blur-sm",
                      playing
                        ? "border-accent/50 bg-accent-soft text-accent"
                        : "border-white/20 bg-black/55 text-white"
                    )}
                  >
                    {playing ? (
                      <span className="pulse-dot relative inline-flex h-1 w-1 rounded-full bg-accent" />
                    ) : null}
                    {g.status}
                  </span>
                ) : null}

                {/* resting label */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-2.5 transition-opacity duration-300 group-hover:opacity-0">
                  <h3 className="truncate text-xs font-semibold text-white">{g.title}</h3>
                  {m.year || g.platforms?.[0] ? (
                    <div className="mono mt-0.5 text-[10px] text-white/65">
                      {[m.year, g.platforms?.[0]].filter(Boolean).join(" · ")}
                    </div>
                  ) : null}
                </div>

                {/* hover detail */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/80 to-black/20 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <h3 className="text-sm font-semibold leading-tight text-white">{g.title}</h3>
                  {detail ? <div className="mono mt-1 text-[11px] text-accent">{detail}</div> : null}
                  <p className="mt-2 text-[13px] leading-relaxed text-white/90">{g.note}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {g.platforms.map((p) => (
                      <span
                        key={p}
                        className="mono rounded border border-white/25 px-1.5 py-0.5 text-[9px] text-white/85"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                  {m.url ? (
                    <span className="mono mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-accent">
                      ▶ VIEW ON STEAM <ArrowUpRight className="h-3 w-3" />
                    </span>
                  ) : null}
                </div>
              </a>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
