"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Background music via the Web Audio API (not an <audio> element) so iOS does
 * NOT surface the loop in Now Playing / the Dynamic Island, and it won't hijack
 * the user's real music app.
 *
 * iOS unlock is finicky: resume() must run synchronously in a gesture AND a
 * source node must actually start inside a gesture (resume alone reports
 * "running" but stays muted). A scroll fires pointer events but does NOT count
 * as an activation, so we must NOT consume a one-shot listener on it. Instead we
 * keep the gesture listeners attached and re-attempt on every gesture until the
 * loop is genuinely running, then detach. Scrolling can't unlock; the next real
 * tap will. Playback pauses when backgrounded; the on/off choice persists.
 */
const SRC = "/audio/menu.mp3";
const LS_KEY = "music-on";
const GESTURES = ["pointerdown", "pointerup", "touchend", "click", "keydown"] as const;

export function MusicPlayer({ className }: { className?: string }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const bufRef = useRef<AudioBuffer | null>(null);
  const loadRef = useRef<Promise<void> | null>(null);
  const startedRef = useRef(false);
  const wantRef = useRef(false);
  const aliveRef = useRef(true);
  const detachRef = useRef<() => void>(() => {});

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

  const loadBuffer = useCallback(() => {
    if (bufRef.current || !ctxRef.current) return;
    if (!loadRef.current) {
      loadRef.current = fetch(SRC)
        .then((r) => r.arrayBuffer())
        .then((ab) => ctxRef.current!.decodeAudioData(ab))
        .then((buf) => {
          bufRef.current = buf;
          // If a prior gesture already unlocked + resumed the context, start the
          // real loop now and we're done autostarting.
          if (
            aliveRef.current &&
            wantRef.current &&
            ctxRef.current?.state === "running"
          ) {
            startSource();
            setPlaying(true);
            detachRef.current();
          }
        })
        .catch(() => {});
    }
  }, [startSource]);

  // Called from each gesture (and the button). Safe to call repeatedly.
  const play = useCallback(() => {
    const ctx = buildGraph();
    if (!ctx) return;
    wantRef.current = true;
    // iOS unlock: start a 1-sample silent buffer *inside the gesture*. Repeat on
    // every gesture until the real loop runs — a scroll won't unlock, a tap will.
    if (!startedRef.current) {
      try {
        const s = ctx.createBufferSource();
        s.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
        s.connect(ctx.destination);
        s.start(0);
      } catch {
        /* ignore */
      }
    }
    if (bufRef.current) startSource();
    else loadBuffer();
    ctx
      .resume()
      .then(() => {
        const running = ctx.state === "running";
        if (aliveRef.current) setPlaying(running && startedRef.current);
        if (running && startedRef.current) detachRef.current(); // autostart done
      })
      .catch(() => {});
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

    const detach = () => GESTURES.forEach((ev) => window.removeEventListener(ev, onGesture));
    const arm = () => GESTURES.forEach((ev) => window.addEventListener(ev, onGesture));
    detachRef.current = detach;

    window.addEventListener("arcade-music", onArcade);
    document.addEventListener("visibilitychange", onVisibility);
    // Arm autostart now (not behind the HEAD check) so a slow mobile connection
    // can't let the first tap slip by unarmed. Listeners persist until the loop
    // is actually running, so a scroll can't waste the chance.
    if (localStorage.getItem(LS_KEY) !== "false") {
      wantRef.current = true;
      arm();
    }

    // Confirm the track exists (hide control if not) and preload + decode it.
    fetch(SRC, { method: "HEAD" })
      .then((res) => {
        if (!aliveRef.current) return;
        if (!res.ok) {
          setAvailable(false);
          return;
        }
        buildGraph();
        loadBuffer();
      })
      .catch(() => {
        if (aliveRef.current) setAvailable(false);
      });

    return () => {
      aliveRef.current = false;
      detach();
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
