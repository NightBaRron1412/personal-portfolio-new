"use client";

import { useCallback, useEffect, useRef, useState, type SyntheticEvent } from "react";
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
type Game = (typeof GAMES)[number];

function HudStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <span className="mono text-[11px]">
      <span className="uppercase tracking-wide text-text-faint">{label} </span>
      <span className={accent ? "font-semibold text-text-primary" : "text-text-primary"}>
        {value}
      </span>
    </span>
  );
}

function Cover({ m, title, onReady }: { m: Meta; title: string; onReady: () => void }) {
  const [failed, setFailed] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const finishLoading = useCallback(
    (image: HTMLImageElement) => {
      void image
        .decode()
        .catch(() => {})
        .then(onReady);
    },
    [onReady]
  );

  // A cached image can finish before React attaches its onLoad handler.
  useEffect(() => {
    const image = imageRef.current;
    if (!image?.complete) return;
    if (image.naturalWidth) finishLoading(image);
    else {
      setFailed(true);
      onReady();
    }
  }, [finishLoading, onReady]);

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    finishLoading(event.currentTarget);
  };
  const handleError = () => {
    setFailed(true);
    onReady();
  };

  if (!m.cover || failed) {
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
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-55 blur-xl"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imageRef}
          data-game-cover
          src={m.cover}
          alt={`${title} cover`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 m-auto h-auto w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imageRef}
      data-game-cover
      src={m.cover}
      alt={`${title} cover`}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
}

function GameCard({ game, index }: { game: Game; index: number }) {
  const m = meta[game.slug] ?? ({} as Meta);
  const playing = /playing/i.test(game.status ?? "");
  const detail = [m.year, ...(m.genres ?? [])].filter(Boolean).join(" · ");
  const [coverReady, setCoverReady] = useState(!m.cover);
  const markCoverReady = useCallback(() => setCoverReady(true), []);

  return (
    <Reveal
      ready={coverReady}
      variant="game"
      threshold={0.05}
      delay={(index % 2) * 90}
      className="game-reveal"
    >
      <a
        data-game-card
        href={m.url ?? undefined}
        target={m.url ? "_blank" : undefined}
        rel="noopener noreferrer"
        className={cn(
          "group relative block aspect-[2/3] overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated transition-all duration-300 hover:-translate-y-1.5 hover:border-accent hover:shadow-glow hover:ring-2 hover:ring-accent/50",
          playing && "border-accent/40 shadow-glow ring-1 ring-accent/30"
        )}
      >
        <Cover m={m} title={game.title} onReady={markCoverReady} />

        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-[160%] skew-x-[-16deg] bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:[animation:gameSheen_0.75s_ease-out]"
        />

        <span className="num pointer-events-none absolute right-1.5 top-0.5 z-10 text-2xl font-bold text-white/20 mix-blend-overlay">
          {String(index + 1).padStart(2, "0")}
        </span>

        {game.status ? (
          <span
            className={cn(
              "absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide backdrop-blur-sm",
              playing
                ? "bottom-16 top-auto border-accent/70 bg-black/80 text-accent"
                : "border-white/20 bg-black/55 text-white"
            )}
          >
            {playing ? (
              <span className="pulse-dot relative inline-flex h-1 w-1 rounded-full bg-accent" />
            ) : null}
            {game.status}
          </span>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-2.5 transition-opacity duration-300 group-hover:opacity-0">
          <h3 className="truncate text-xs font-semibold text-white">{game.title}</h3>
          {m.year || game.platforms?.[0] ? (
            <div className="mono mt-0.5 text-[10px] text-white/65">
              {[m.year, game.platforms?.[0]].filter(Boolean).join(" · ")}
            </div>
          ) : null}
        </div>

        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/80 to-black/20 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <h3 className="text-sm font-semibold leading-tight text-white">{game.title}</h3>
          {detail ? <div className="mono mt-1 text-[11px] text-accent">{detail}</div> : null}
          <p className="mt-2 text-[13px] leading-relaxed text-white/90">{game.note}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {game.platforms.map((platform) => (
              <span
                key={platform}
                className="mono rounded border border-white/25 px-1.5 py-0.5 text-[9px] text-white/85"
              >
                {platform}
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
        {GAMES.map((game, index) => (
          <GameCard key={game.slug} game={game} index={index} />
        ))}
      </div>
    </div>
  );
}
