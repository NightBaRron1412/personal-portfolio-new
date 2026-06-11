"use client";

import { Zap, ZapOff } from "lucide-react";
import { useMotionPreference } from "../motion-provider";

/**
 * Reduce-motion control. The page is deliberately animation-dense (plasma
 * shader, constellation field, decoder text, scroll-reactive surfaces), so we
 * expose a first-class switch to calm it — clicking flips the single
 * `data-force-motion` flag that the whole design already respects (the global
 * CSS reduced-motion rules and the canvas RAF loops both key off it).
 *
 * The default follows the OS `prefers-reduced-motion` setting until the visitor
 * makes a choice; the choice then persists in localStorage. We mirror the
 * ThemeToggle's shape/markup so the two controls read as a matched pair.
 */
export function MotionToggle({ className }: { className?: string }) {
  const { hydrated, motionEnabled, toggleMotion } = useMotionPreference();

  return (
    <button
      type="button"
      aria-pressed={hydrated ? !motionEnabled : undefined}
      aria-label={
        hydrated ? (motionEnabled ? "Reduce motion" : "Enable motion") : "Toggle motion"
      }
      title={hydrated ? (motionEnabled ? "Reduce motion" : "Enable motion") : undefined}
      onClick={toggleMotion}
      className={
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-secondary transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent " +
        (className ?? "")
      }
    >
      <span className="relative h-[18px] w-[18px]" aria-hidden>
        <Zap
          className={
            "absolute inset-0 h-[18px] w-[18px] transition-all duration-500 " +
            // Show the "motion on" glyph by default (pre-hydration) so the
            // button never flashes empty.
            (!hydrated || motionEnabled ? "scale-100 opacity-100" : "scale-50 opacity-0")
          }
        />
        <ZapOff
          className={
            "absolute inset-0 h-[18px] w-[18px] transition-all duration-500 " +
            (hydrated && !motionEnabled ? "scale-100 opacity-100" : "scale-50 opacity-0")
          }
        />
      </span>
    </button>
  );
}
