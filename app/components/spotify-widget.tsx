"use client";

import { useEffect, useState } from "react";
import { Music } from "lucide-react";

type SpotifyData = {
  isPlaying: boolean;
  notConfigured?: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumArt?: string;
  songUrl?: string;
  progress?: number;
  duration?: number;
};

/** Compact floating now-playing widget pinned to the bottom-left. */
export function SpotifyWidget() {
  const [data, setData] = useState<SpotifyData | null>(null);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/spotify", { cache: "no-store" })
        .then((r) => r.json())
        .then((json: SpotifyData) => {
          if (!alive) return;
          if (json?.notConfigured || (!json?.title && !json?.albumArt)) {
            setReady(false);
            return;
          }
          setData(json);
          setProgress(json.progress ?? 0);
          setDuration(json.duration ?? 0);
          setReady(true);
        })
        .catch(() => {});
    load();
    const poll = setInterval(load, 20000);
    return () => {
      alive = false;
      clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    if (!data?.isPlaying) return;
    const id = setInterval(() => {
      setProgress((p) => (duration ? Math.min(p + 1000, duration) : p));
    }, 1000);
    return () => clearInterval(id);
  }, [data?.isPlaying, duration]);

  if (!data) return null;
  const pct = duration ? Math.min(100, (progress / duration) * 100) : 0;

  return (
    <div
      role="complementary"
      aria-label="Now playing on Spotify"
      className="spotify-widget fixed bottom-4 left-4 z-40 max-w-[220px]"
      style={{ transform: ready ? "translateY(0)" : "translateY(160%)", opacity: ready ? 1 : 0 }}
    >
      <a
        href={data.songUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 rounded-xl border border-border-subtle bg-bg-secondary/95 p-2 pr-3 shadow-soft backdrop-blur-md transition-colors hover:border-accent/40"
      >
        {/* album art */}
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-border-subtle">
          {data.albumArt ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.albumArt} alt={data.album ?? ""} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-bg-elevated">
              <Music className="h-4 w-4 text-text-faint" />
            </div>
          )}
        </div>

        {/* info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {data.isPlaying ? (
              <span className="eq" aria-hidden>
                <span />
                <span />
                <span />
              </span>
            ) : (
              <span className="h-1 w-1 rounded-full bg-text-faint" />
            )}
            <span className="mono text-[8px] uppercase tracking-wider text-accent">
              {data.isPlaying ? "playing" : "last played"}
            </span>
          </div>
          <p className="truncate text-xs font-semibold text-text-primary transition-colors group-hover:text-accent">
            {data.title}
          </p>
          <p className="truncate text-[10px] text-text-secondary">{data.artist}</p>
          {data.isPlaying ? (
            <div className="mt-1.5 h-[2px] w-full overflow-hidden rounded-full bg-bg-elevated">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-1000 ease-linear"
                style={{ width: `${pct}%` }}
              />
            </div>
          ) : null}
        </div>
      </a>
    </div>
  );
}
