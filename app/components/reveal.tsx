"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  variant?: "default" | "game";
  /** stagger delay in ms */
  delay?: number;
  /** trigger threshold 0..1 */
  threshold?: number;
  /** Wait for required content (such as a cover image) before revealing. */
  ready?: boolean;
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
  ready = true,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const animationsRef = useRef<Animation[]>([]);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !ready) return;

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    let cancelled = false;
    let revealing = false;
    const isMobileGame = variant === "game" && window.matchMedia("(max-width: 767px)").matches;

    const reveal = () => {
      if (revealing) return;
      revealing = true;
      observer.disconnect();

      if (variant !== "game" || typeof el.animate !== "function" || prefersReducedMotion()) {
        setShown(true);
        return;
      }

      // Let the decoded cover paint once before changing the card's opacity.
      // Safari can otherwise merge its first transition frame into the last.
      requestAnimationFrame(() => {
        if (cancelled) return;
        const entranceDelay = delay + 90;
        const animations = [
          el.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 900,
            delay: entranceDelay,
            easing: "linear",
            fill: "both",
          }),
          el.animate(
            [
              { transform: "translate3d(0, 44px, 0) scale(0.94)" },
              { transform: "translate3d(0, 0, 0) scale(1)" },
            ],
            {
              duration: 900,
              delay: entranceDelay,
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
              fill: "both",
            }
          ),
        ];
        animationsRef.current = animations;
        setShown(true);
        const finish = () => {
          if (animationsRef.current === animations) {
            animations.forEach((animation) => animation.cancel());
            animationsRef.current = [];
          }
        };
        void Promise.all(animations.map((animation) => animation.finished)).then(finish, finish);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            reveal();
            break;
          }
        }
      },
      { threshold, rootMargin: isMobileGame ? "0px 0px -38% 0px" : "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [delay, ready, threshold, variant]);

  useEffect(() => () => animationsRef.current.forEach((animation) => animation.cancel()), []);

  return (
    <Tag
      ref={ref}
      data-reveal={shown ? "in" : ""}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}
