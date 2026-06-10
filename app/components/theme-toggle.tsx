"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/**
 * Animated theme toggle — the 21st.dev / MagicUI "Animated Theme Toggler"
 * technique (View Transitions API): the new theme reveals as a circle expanding
 * from the button. Wired to next-themes (we flip the class synchronously inside
 * the transition so the captured "new" snapshot is correct, independent of
 * next-themes' effect timing). Falls back to an instant switch where View
 * Transitions are unsupported or reduced-motion is requested.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  const toggle = async () => {
    const next = isDark ? "light" : "dark";
    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      document.documentElement.getAttribute("data-force-motion") !== "true";

    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    };

    if (!ref.current || typeof doc.startViewTransition !== "function" || reduced) {
      setTheme(next);
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = doc.startViewTransition(() => {
      flushSync(() => {
        // Flip the class synchronously so the VT "new" snapshot is the new theme.
        const root = document.documentElement;
        root.classList.remove(isDark ? "dark" : "light");
        root.classList.add(next);
        root.style.colorScheme = next;
        setTheme(next);
      });
    });

    await transition.ready;
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 560,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  };

  return (
    <button
      ref={ref}
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
