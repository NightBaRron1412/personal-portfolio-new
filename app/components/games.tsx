"use client";

import GAMES from "@/data/games.json";
import META from "@/data/games.meta.json";
import { Reveal } from "./reveal";

type Meta = {
  appid: string | null;
  cover: string | null;
  year: string | null;
  genres: string[];
  url: string | null;
};

const meta = META as unknown as Record<string, Meta>;

/**
 * "Off the Clock" — a cover-art shelf of games I love. Covers + metadata are
 * pulled from Steam at build time (scripts/gen-games.mjs) into
 * public/images/games + data/games.meta.json; titles without a cover (e.g. an
 * unreleased game) fall back to a gradient tile.
 */
export function Games() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
      {GAMES.map((g, i) => {
        const m = meta[g.slug] ?? ({} as Meta);
        const sub = [m.year, g.platforms?.[0]].filter(Boolean).join(" · ");
        const detail = [m.year, ...(m.genres ?? [])].filter(Boolean).join(" · ");
        return (
          <Reveal key={g.slug} delay={(i % 5) * 60}>
            <a
              href={m.url ?? undefined}
              target={m.url ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="group relative block aspect-[2/3] overflow-hidden rounded-xl border border-border-subtle bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-glow"
            >
              {m.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.cover}
                  alt={`${g.title} cover`}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center p-3 text-center"
                  style={{ background: "var(--gradient)" }}
                >
                  <span className="font-display text-base font-semibold text-text-on-accent">
                    {g.title}
                  </span>
                </div>
              )}

              {g.status ? (
                <span className="absolute left-2 top-2 z-10 rounded-md border border-white/20 bg-black/55 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
                  {g.status}
                </span>
              ) : null}

              {/* resting label */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 transition-opacity duration-300 group-hover:opacity-0">
                <h3 className="text-sm font-semibold leading-tight text-white">{g.title}</h3>
                {sub ? <div className="mono mt-1 text-[10px] text-white/70">{sub}</div> : null}
              </div>

              {/* hover detail */}
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/92 via-black/70 to-black/20 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <h3 className="text-sm font-semibold leading-tight text-white">{g.title}</h3>
                <p className="mt-1.5 text-[11px] leading-snug text-white/85">{g.note}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {g.platforms.map((p) => (
                    <span
                      key={p}
                      className="mono rounded border border-white/20 px-1 py-0.5 text-[9px] text-white/80"
                    >
                      {p}
                    </span>
                  ))}
                </div>
                {detail ? <div className="mono mt-2 text-[10px] text-accent">{detail}</div> : null}
              </div>
            </a>
          </Reveal>
        );
      })}
    </div>
  );
}
