"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cycles through phrases with a type/delete effect. Falls back to the first
 * phrase (static) when the OS prefers reduced motion.
 */
export function Typewriter({
  words,
  className,
  typingSpeed = 52,
  deleteSpeed = 28,
  pause = 1700,
}: {
  words: string[];
  className?: string;
  typingSpeed?: number;
  deleteSpeed?: number;
  pause?: number;
}) {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      document.documentElement.getAttribute("data-force-motion") !== "true";
    if (reduced.current) setText(words[0] ?? "");
  }, [words]);

  useEffect(() => {
    if (reduced.current || words.length === 0) return;
    const current = words[index % words.length];

    if (!deleting && text === current) {
      const t = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(t);
    }
    if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => i + 1);
      return;
    }
    const t = setTimeout(
      () =>
        setText(
          deleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1)
        ),
      deleting ? deleteSpeed : typingSpeed
    );
    return () => clearTimeout(t);
  }, [text, deleting, index, words, typingSpeed, deleteSpeed, pause]);

  return (
    <span className={className}>
      {text}
      <span className="type-caret" aria-hidden>
        ▌
      </span>
    </span>
  );
}
