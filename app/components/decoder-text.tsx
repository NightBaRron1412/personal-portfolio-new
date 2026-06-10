"use client";

import { useEffect, useRef, useState, type ElementType } from "react";

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&/<>{}[]=*+";

/**
 * DecoderText — resolves the text from scrambling glyphs (left→right) when it
 * scrolls into view, for a "decrypting" telemetry feel. SSR-safe (renders the
 * real string), a11y-safe (aria-label carries the real text), and reduced-motion
 * safe (shows the text instantly).
 */
export function DecoderText({
  text,
  className,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [display, setDisplay] = useState(text);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      document.documentElement.getAttribute("data-force-motion") !== "true";
    if (reduced) {
      setDisplay(text);
      return;
    }

    const chars = [...text];
    const STEP = 38; // ms stagger per character
    const SCRAMBLE = 260; // ms a character scrambles before it settles
    let raf = 0;
    let startTime = 0;

    const run = (now: number) => {
      if (!startTime) startTime = now;
      const t = now - startTime;
      let done = true;
      let out = "";
      for (let i = 0; i < chars.length; i++) {
        const ch = chars[i]!;
        if (ch === " ") {
          out += " ";
          continue;
        }
        if (t >= i * STEP + SCRAMBLE) {
          out += ch;
        } else {
          done = false;
          out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
      }
      setDisplay(done ? text : out);
      if (!done) raf = requestAnimationFrame(run);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();
        raf = requestAnimationFrame(run);
      },
      { threshold: 0, rootMargin: "0px 0px -12% 0px" }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [text]);

  return (
    <Tag ref={ref} className={className}>
      {/* real text for screen readers (the animated glyphs are decorative) */}
      <span className="sr-only">{text}</span>
      <span aria-hidden>{display}</span>
    </Tag>
  );
}
