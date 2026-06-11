"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

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
 * "arcade mode" (scanlines + vignette + punchier color) and kick off the music.
 * Enter it again to exit. Costs nothing for visitors who never find it.
 */
export function ArcadeMode() {
  useEffect(() => {
    let idx = 0;

    const toggle = () => {
      const el = document.documentElement;
      const on = el.getAttribute("data-arcade") === "true";
      if (on) {
        el.removeAttribute("data-arcade");
        toast("Arcade mode off", { icon: "⏻", duration: 1800 });
      } else {
        el.setAttribute("data-arcade", "true");
        toast("ARCADE MODE · ↑↑↓↓←→←→ B A", { icon: "🕹️", duration: 2800 });
        window.dispatchEvent(new CustomEvent("arcade-music"));
      }
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
        // restart, but allow this key to be the start of a fresh attempt
        idx = key === CODE[0] ? 1 : 0;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
