"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** optional entrance treatment */
  variant?: "default" | "game" | "mobile";
  /** stagger delay in ms */
  delay?: number;
  /** trigger threshold 0..1 */
  threshold?: number;
  /** IntersectionObserver margin, useful for entrances that should start at the viewport edge */
  rootMargin?: string;
};

/**
 * Reveal-on-scroll. Renders with `data-reveal` (hidden via globals.css) and
 * flips to `data-reveal="in"` once intersecting. A <noscript> rule in the
 * layout reveals everything when JS is unavailable; reduced-motion forces
 * the visible state too.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  variant = "default",
  delay = 0,
  threshold = 0,
  rootMargin = "0px 0px -8% 0px",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const animationRef = useRef<Animation | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const shouldUseMobileEntrance =
              variant !== "default" &&
              window.matchMedia("(max-width: 767px)").matches &&
              typeof el.animate === "function" &&
              !prefersReducedMotion();

            if (shouldUseMobileEntrance) {
              const animation = el.animate(
                [
                  { opacity: 0, transform: "translate3d(0, 34px, 0) scale(0.96)" },
                  { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
                ],
                {
                  duration: 700,
                  delay,
                  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
                  fill: "both",
                }
              );
              animationRef.current = animation;
              void animation.finished.then(
                () => {
                  if (animationRef.current === animation) {
                    animation.cancel();
                    animationRef.current = null;
                  }
                },
                () => undefined
              );
            }

            setShown(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, rootMargin, threshold, variant]);

  useEffect(
    () => () => {
      animationRef.current?.cancel();
    },
    []
  );

  return (
    <Tag
      ref={ref}
      data-reveal={shown ? "in" : ""}
      data-reveal-variant={variant}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}
