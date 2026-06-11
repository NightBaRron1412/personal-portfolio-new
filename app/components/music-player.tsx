"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Background music played through the Web Audio API rather than an <audio>
 * element. An <audio>/<video> element registers with the OS "Now Playing"
 * surface — on iOS that means the track shows in the Dynamic Island / lock
 * screen and hijacks the user's real music app. Web Audio output does not, so
 * the loop stays invisible to the system while still being user-controllable.
 *
 * Autoplay-with-sound is blocked until a gesture, so we build the graph up front
 * (suspended) and resume it on the first interaction. Playback pauses when the
 * tab/app is backgrounded and resumes on return; the on/off choice persists.
 * If `/audio/menu.mp3` is missing, the control hides itself.
 */
const SRC = "/audio/menu.mp3";
const LS_KEY = "music-on";

export function MusicPlayer({ className }: { className?: string }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const bufRef = useRef<AudioBuffer | null>(null);
  const loadRef = useRef<Promise<void> | null>(null);
  const startedRef = useRef(false);
  const aliveRef = useRef(true);

  const [available, setAvailable] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Lazily create the audio graph and decode the track (once).
  const ensureGraph = useCallback(async () => {
    if (!ctxRef.current) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) throw new Error("Web Audio unsupported");
      const ctx = new Ctor();
      const gain = ctx.createGain();
      gain.gain.value = 0.32;
      gain.connect(ctx.destination);
      ctxRef.current = ctx;
      gainRef.current = gain;
    }
    if (!bufRef.current) {
      if (!loadRef.current) {
        loadRef.current = fetch(SRC)
          .then((r) => r.arrayBuffer())
          .then((ab) => ctxRef.current!.decodeAudioData(ab))
          .then((buf) => {
            bufRef.current = buf;
          });
      }
      await loadRef.current;
    }
  }, []);

  const start = useCallback(async () => {
    try {
      await ensureGraph();
      const ctx = ctxRef.current;
      if (!aliveRef.current || !ctx || !gainRef.current || !bufRef.current) return;
      if (!startedRef.current) {
        const src = ctx.createBufferSource();
        src.buffer = bufRef.current;
        src.loop = true;
        src.connect(gainRef.current);
        src.start();
        startedRef.current = true;
      }
      await ctx.resume(); // unblocked only inside a real gesture
      if (aliveRef.current) setPlaying(ctx.state === "running");
    } catch {
      /* autoplay blocked until a gesture — ignore */
    }
  }, [ensureGraph]);

  const suspend = useCallback(async () => {
    const ctx = ctxRef.current;
    if (ctx && ctx.state === "running") await ctx.suspend();
    if (aliveRef.current) setPlaying(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    aliveRef.current = true;
    let wasPlaying = false;

    const onGesture = () => void start();
    const onArcade = () => {
      localStorage.setItem(LS_KEY, "true"); // Konami easter egg starts it
      void start();
    };
    const onVisibility = () => {
      const ctx = ctxRef.current;
      if (document.hidden) {
        if (ctx && ctx.state === "running") {
          wasPlaying = true;
          void ctx.suspend();
          setPlaying(false);
        }
      } else if (wasPlaying) {
        wasPlaying = false;
        if (localStorage.getItem(LS_KEY) !== "false") void start();
      }
    };
    const opts = { once: true } as AddEventListenerOptions;

    // Confirm the track exists before showing the control; then arm autostart
    // unless the visitor opted out.
    fetch(SRC, { method: "HEAD" })
      .then((res) => {
        if (!aliveRef.current) return;
        if (!res.ok) {
          setAvailable(false);
          return;
        }
        window.addEventListener("arcade-music", onArcade);
        document.addEventListener("visibilitychange", onVisibility);
        if (localStorage.getItem(LS_KEY) === "false") return;
        void start(); // stays suspended until the first gesture resumes it
        window.addEventListener("pointerdown", onGesture, opts);
        window.addEventListener("keydown", onGesture, opts);
      })
      .catch(() => {
        if (aliveRef.current) setAvailable(false);
      });

    return () => {
      aliveRef.current = false;
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      window.removeEventListener("arcade-music", onArcade);
      document.removeEventListener("visibilitychange", onVisibility);
      const ctx = ctxRef.current;
      ctxRef.current = null;
      if (ctx) void ctx.close();
    };
  }, [start]);

  const toggle = () => {
    if (playing) {
      void suspend();
      localStorage.setItem(LS_KEY, "false");
    } else {
      localStorage.setItem(LS_KEY, "true");
      void start();
    }
  };

  if (!available) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted ? (playing ? "Mute music" : "Play music") : "Toggle music"}
      aria-pressed={mounted ? playing : undefined}
      title={mounted ? (playing ? "Mute music" : "Play music") : undefined}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-secondary transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        playing && "border-accent/40 text-accent",
        className
      )}
    >
      {playing ? (
        <Volume2 className="h-[18px] w-[18px]" />
      ) : (
        <VolumeX className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}
