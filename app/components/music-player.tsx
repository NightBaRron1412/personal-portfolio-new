"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Background music toggle. Browsers block autoplay *with sound* until a user
 * gesture, so we arm the track and start it on the visitor's first interaction
 * (and via the button). The choice persists, so anyone who turns it off won't
 * be re-blasted on the next visit. If `/audio/menu.mp3` is missing, the audio
 * element errors and the control hides itself.
 */
const SRC = "/audio/menu.mp3";
const LS_KEY = "music-on";

export function MusicPlayer({ className }: { className?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [available, setAvailable] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.32;

    const sync = () => setPlaying(!audio.paused);
    audio.addEventListener("play", sync);
    audio.addEventListener("pause", sync);

    const onGesture = () => audio.play().catch(() => {});
    const onArcade = () => audio.play().catch(() => {}); // Konami easter egg starts it
    const opts = { once: true } as AddEventListenerOptions;
    let cancelled = false;

    // Confirm the track exists before showing the control; then arm autostart
    // unless the visitor opted out. Autoplay-with-sound is blocked until a
    // gesture, so playback begins on the first click / scroll / keypress.
    fetch(SRC, { method: "HEAD" })
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          setAvailable(false);
          return;
        }
        audio.src = SRC; // set only once the file is confirmed (avoids a 404)
        window.addEventListener("arcade-music", onArcade);
        if (localStorage.getItem(LS_KEY) === "false") return;
        audio.play().catch(() => {});
        // Only real activation gestures can start audio — a scroll/wheel does
        // NOT count under the browser autoplay policy, so we don't listen for it.
        window.addEventListener("pointerdown", onGesture, opts);
        window.addEventListener("keydown", onGesture, opts);
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });

    return () => {
      cancelled = true;
      audio.removeEventListener("play", sync);
      audio.removeEventListener("pause", sync);
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      window.removeEventListener("arcade-music", onArcade);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
      localStorage.setItem(LS_KEY, "true");
    } else {
      audio.pause();
      localStorage.setItem(LS_KEY, "false");
    }
  };

  if (!available) return null;

  return (
    <>
      <audio ref={audioRef} loop preload="auto" />
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
          <span className="relative inline-flex items-center justify-center">
            <Volume2 className="h-[18px] w-[18px]" />
          </span>
        ) : (
          <VolumeX className="h-[18px] w-[18px]" />
        )}
      </button>
    </>
  );
}
