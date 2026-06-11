"use client";

import { useEffect, useRef, useState } from "react";

// The Konami code. ↑ ↑ ↓ ↓ ← → ← → B A
const CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/**
 * Hidden easter egg: enter the Konami code to flip the site into a retro CRT
 * "arcade mode" — a power-on flash, a glitchy CHEAT UNLOCKED banner, a
 * persistent HUD, scanlines/vignette, and (if present) the menu music. Enter it
 * again to exit. Costs nothing for visitors who never find it.
 */
export function ArcadeMode() {
  const [on, setOn] = useState(false);
  const [banner, setBanner] = useState<"on" | "off" | null>(null);
  const onRef = useRef(false);

  useEffect(() => {
    let idx = 0;
    let timer: ReturnType<typeof setTimeout>;

    const toggle = () => {
      const next = !onRef.current;
      onRef.current = next;
      setOn(next);
      const el = document.documentElement;
      if (next) {
        el.setAttribute("data-arcade", "true");
        window.dispatchEvent(new CustomEvent("arcade-music"));
      } else {
        el.removeAttribute("data-arcade");
      }
      setBanner(next ? "on" : "off");
      clearTimeout(timer);
      timer = setTimeout(() => setBanner(null), 2200);
    };

    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === CODE[idx]) {
        idx += 1;
        if (idx === CODE.length) {
          idx = 0;
          toggle();
        }
      } else {
        idx = key === CODE[0] ? 1 : 0;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {banner ? (
        <div className="arcade-banner" role="status" aria-live="polite" data-state={banner}>
          <div className="arcade-banner-card">
            <span className="arcade-banner-title" data-text={banner === "on" ? "ARCADE MODE" : "GAME OVER"}>
              {banner === "on" ? "ARCADE MODE" : "GAME OVER"}
            </span>
            <span className="arcade-banner-sub">
              {banner === "on" ? "▲▲▼▼◄►◄► B A · CHEAT UNLOCKED" : "back to reality"}
            </span>
          </div>
        </div>
      ) : null}

      {on ? (
        <div className="arcade-hud" aria-hidden>
          <span className="arcade-hud-dot" />
          ARCADE MODE
          <span className="arcade-hud-hint">↑↑↓↓←→←→BA to exit</span>
        </div>
      ) : null}
    </>
  );
}
