"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/**
 * Theme toggle. We flip the theme instantly — the page is visually heavy, so a
 * universal color crossfade forced an expensive style recalc that hitched the
 * switch. The dominant page background eases (one cheap transition) and the
 * shader plasma eases its own colors, so the flip still reads as smooth without
 * the jank / disappearing layers of the earlier View-Transitions approach.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  const toggle = () => setTheme(isDark ? "light" : "dark");

  return (
    <button
      type="button"
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Toggle theme"}
      onClick={toggle}
      className={
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-secondary transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent " +
        (className ?? "")
      }
    >
      <span className="relative h-[18px] w-[18px]" aria-hidden>
        <Sun
          className={
            "absolute inset-0 h-[18px] w-[18px] transition-all duration-500 " +
            (mounted && isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-50 opacity-0")
          }
        />
        <Moon
          className={
            "absolute inset-0 h-[18px] w-[18px] transition-all duration-500 " +
            (mounted && !isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0")
          }
        />
      </span>
    </button>
  );
}
