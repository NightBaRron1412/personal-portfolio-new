"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Music, Pause, ExternalLink } from "lucide-react";

interface SpotifyData {
  isPlaying: boolean;
  notConfigured?: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumArt?: string;
  songUrl?: string;
  progress?: number;
  duration?: number;
}

function SoundBars({ playing }: { playing: boolean }) {
  return (
    <div className="flex items-end gap-[2.5px] h-[14px]">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-emerald-400"
          animate={
            playing
              ? {
                  height: ["4px", "14px", "6px", "12px", "4px"],
                }
              : { height: "4px" }
          }
          transition={
            playing
              ? {
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
}

export function SpotifyNowPlaying() {
  const [data, setData] = useState<SpotifyData | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  const fetchNowPlaying = useCallback(async () => {
    try {
      const res = await fetch("/api/spotify");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.progress && json.duration) {
          setProgress((json.progress / json.duration) * 100);
        }
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNowPlaying();
    // Poll every 30 seconds
    const interval = setInterval(fetchNowPlaying, 30000);
    return () => clearInterval(interval);
  }, [fetchNowPlaying]);

  // Smooth progress bar animation
  useEffect(() => {
    if (!data?.isPlaying || !data.progress || !data.duration) return;
    const startTime = Date.now();
    const startProgress = data.progress;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = startProgress + elapsed;
      const percent = Math.min((currentProgress / data.duration!) * 100, 100);
      setProgress(percent);
    }, 1000);

    return () => clearInterval(timer);
  }, [data?.isPlaying, data?.progress, data?.duration]);

  const [titleOverflows, setTitleOverflows] = useState(false);
  const titleRef = useCallback((el: HTMLParagraphElement | null) => {
    if (!el) return;
    requestAnimationFrame(() => {
      setTitleOverflows(el.scrollWidth > el.parentElement!.clientWidth);
    });
  }, [data?.title]);

  // Don't render if loading, not configured, or no data
  if (loading || data?.notConfigured || !data?.title) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={data.title}
        className="fixed bottom-4 left-4 z-40 max-w-[220px]"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.95 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
        exit={prefersReducedMotion ? {} : { opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <a
          href={data.songUrl}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-secondary/95 p-2 pr-3 shadow-soft backdrop-blur-md transition-all hover:border-emerald-500/30 hover:shadow-glow"
        >
          {/* Album Art */}
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg">
            {data.albumArt ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.albumArt}
                alt={data.album}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-bg-elevated">
                <Music className="h-5 w-5 text-text-secondary" />
              </div>
            )}
            {/* Spinning vinyl overlay for playing state */}
            {data.isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="h-3 w-3 rounded-full border-2 border-white/60" />
              </div>
            )}
          </div>

          {/* Track Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <SoundBars playing={!!data.isPlaying} />
              <span className="text-[8px] font-medium uppercase tracking-wider text-emerald-400">
                {data.isPlaying ? "Playing" : "Last Played"}
              </span>
            </div>
            <div className="overflow-hidden">
              <p
                ref={titleRef}
                className={`text-xs font-semibold text-text-primary whitespace-nowrap ${titleOverflows ? "animate-marquee" : ""}`}
              >
                {data.title}
              </p>
            </div>
            <p className="truncate text-[10px] text-text-secondary">
              {data.artist}
            </p>
            {/* Progress Bar */}
            {data.isPlaying && data.duration && (
              <div className="mt-1.5 h-[2px] w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </div>
            )}
          </div>

          {/* External link icon on hover */}
          <ExternalLink className="h-3 w-3 shrink-0 text-text-secondary opacity-0 transition-opacity group-hover:opacity-100" />
        </a>
      </motion.div>
    </AnimatePresence>
  );
}
