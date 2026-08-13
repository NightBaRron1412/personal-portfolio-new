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
  const animationRefs = useRef<Animation[]>([]);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    let cancelled = false;
    let revealing = false;
    let observer: IntersectionObserver | null = null;

    const revealWhenReady = async () => {
      if (revealing) return;
      revealing = true;
      observer?.disconnect();

      const shouldUseMobileEntrance =
        variant !== "default" &&
        window.matchMedia("(max-width: 767px)").matches &&
        typeof el.animate === "function" &&
        !prefersReducedMotion();

      if (shouldUseMobileEntrance && variant === "game") {
        // A loaded image is not necessarily decoded into pixels on iOS. Keep
        // the entire card hidden until its poster can be painted, so Safari
        // cannot reveal the status tag first and snap the artwork in later.
        const posters = Array.from(el.querySelectorAll<HTMLImageElement>("[data-game-cover]"));
        await Promise.all(
          posters.map((poster) =>
            typeof poster.decode === "function"
              ? poster.decode().catch(() => undefined)
              : Promise.resolve()
          )
        );
        if (cancelled) return;

        // Give WebKit one compositor frame to commit the decoded poster layer
        // before the wrapper starts changing opacity.
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        if (cancelled) return;
      }

      if (shouldUseMobileEntrance) {
        // WebKit can merge a zero-delay animation with the React reveal update
        // during momentum scrolling. The backwards-filled delay guarantees a
        // hidden composited frame before either column starts fading.
        const mobileDelay = delay + 90;
        const fade = el.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 900,
          delay: mobileDelay,
          easing: "linear",
          fill: "both",
        });
        const lift = el.animate(
          [
            { transform: "translate3d(0, 44px, 0) scale(0.94)" },
            { transform: "translate3d(0, 0, 0) scale(1)" },
          ],
          {
            duration: 900,
            delay: mobileDelay,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            fill: "both",
          }
        );
        const animations = [fade, lift];
        animationRefs.current = animations;
        const finishAnimations = () => {
          if (animationRefs.current === animations) {
            animations.forEach((animation) => animation.cancel());
            animationRefs.current = [];
          }
        };
        void Promise.all(animations.map((animation) => animation.finished)).then(
          finishAnimations,
          finishAnimations
        );
      }

      setShown(true);
    };

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void revealWhenReady();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [delay, rootMargin, threshold, variant]);

  useEffect(
    () => () => {
      animationRefs.current.forEach((animation) => animation.cancel());
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
