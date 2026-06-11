"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Background music via the Web Audio API (not an <audio> element) so iOS does
 * NOT surface the loop in Now Playing / the Dynamic Island and it won't hijack
 * the user's real music app.
 *
 * iOS gotcha: AudioContext.resume() must be called *synchronously* inside the
 * user gesture — any `await` before it drops the activation and audio stays
 * blocked. So we build the graph and decode the track up front, then on the
 * first interaction we call resume() synchronously (no await). Autoplay-with-
 * sound is blocked until that gesture; scrolling does NOT count as one. Playback
 * pauses when the tab/app is backgrounded; the on/off choice persists.
 */
const SRC = "/audio/menu.mp3";
const LS_KEY = "music-on";

export function MusicPlayer({ className }: { className?: string }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const bufRef = useRef<AudioBuffer | null>(null);
  const loadRef = useRef<Promise<void> | null>(null);
  const startedRef = useRef(false);
  const wantRef = useRef(false);
  const aliveRef = useRef(true);

  const [available, setAvailable] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);

  const buildGraph = useCallback((): AudioContext | null => {
    if (ctxRef.current) return ctxRef.current;
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    const gain = ctx.createGain();
    gain.gain.value = 0.32;
    gain.connect(ctx.destination);
    ctxRef.current = ctx;
    gainRef.current = gain;
    return ctx;
  }, []);

  const startSource = useCallback(() => {
    const ctx = ctxRef.current;
    const gain = gainRef.current;
    const buf = bufRef.current;
    if (!ctx || !gain || !buf || startedRef.current) return;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.connect(gain);
    src.start();
    startedRef.current = true;
  }, []);

  // Fetch + decode the track. When it lands, start the loop if the user has
  // already asked to play and the context is running.
  const loadBuffer = useCallback(() => {
    if (bufRef.current || !ctxRef.current) return;
    if (!loadRef.current) {
      loadRef.current = fetch(SRC)
        .then((r) => r.arrayBuffer())
        .then((ab) => ctxRef.current!.decodeAudioData(ab))
        .then((buf) => {
          bufRef.current = buf;
          if (
            aliveRef.current &&
            wantRef.current &&
            ctxRef.current?.state === "running"
          ) {
            startSource();
            setPlaying(true);
          }
        })
        .catch(() => {});
    }
  }, [startSource]);

  // Must run synchronously inside a gesture: resume() is called before any await.
  const play = useCallback(() => {
    const ctx = buildGraph();
    if (!ctx) return;
    wantRef.current = true;
    if (bufRef.current) startSource();
    else loadBuffer();
    ctx
      .resume()
      .then(() => {
        if (aliveRef.current) setPlaying(ctx.state === "running");
      })
      .catch(() => {});
    setPlaying(true); // optimistic; corrected by the resume() result
  }, [buildGraph, startSource, loadBuffer]);

  const pause = useCallback(() => {
    wantRef.current = false;
    const ctx = ctxRef.current;
    if (ctx && ctx.state === "running") void ctx.suspend();
    setPlaying(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    aliveRef.current = true;
    let wasPlaying = false;

    const onGesture = () => play();
    const onArcade = () => {
      localStorage.setItem(LS_KEY, "true"); // Konami easter egg starts it
      play();
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
        if (localStorage.getItem(LS_KEY) !== "false") play();
      }
    };
    const opts = { once: true } as AddEventListenerOptions;
    const armGestures = () => {
      // WebKit honors these as activation gestures; first one to fire unlocks.
      window.addEventListener("pointerdown", onGesture, opts);
      window.addEventListener("touchend", onGesture, opts);
      window.addEventListener("click", onGesture, opts);
      window.addEventListener("keydown", onGesture, opts);
    };

    // Confirm the track exists before showing the control, then preload it so
    // the first tap can start instantly.
    fetch(SRC, { method: "HEAD" })
      .then((res) => {
        if (!aliveRef.current) return;
        if (!res.ok) {
          setAvailable(false);
          return;
        }
        buildGraph();
        loadBuffer();
        window.addEventListener("arcade-music", onArcade);
        document.addEventListener("visibilitychange", onVisibility);
        if (localStorage.getItem(LS_KEY) === "false") return;
        wantRef.current = true;
        armGestures();
      })
      .catch(() => {
        if (aliveRef.current) setAvailable(false);
      });

    return () => {
      aliveRef.current = false;
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("touchend", onGesture);
      window.removeEventListener("click", onGesture);
      window.removeEventListener("keydown", onGesture);
      window.removeEventListener("arcade-music", onArcade);
      document.removeEventListener("visibilitychange", onVisibility);
      const ctx = ctxRef.current;
      ctxRef.current = null;
      if (ctx) void ctx.close();
    };
  }, [play, buildGraph, loadBuffer]);

  const toggle = () => {
    if (playing) {
      pause();
      localStorage.setItem(LS_KEY, "false");
    } else {
      localStorage.setItem(LS_KEY, "true");
      play();
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
