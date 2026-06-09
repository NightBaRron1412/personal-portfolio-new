"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** stagger delay in ms */
  delay?: number;
  /** trigger threshold 0..1 */
  threshold?: number;
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
  delay = 0,
  threshold = 0,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shown, threshold]);

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
