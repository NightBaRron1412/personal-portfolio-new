"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMotionPreference } from "../motion-provider";

interface ScrollTextRevealProps {
  text: string;
  className?: string;
  as?: "h2" | "p" | "span";
  staggerDelay?: number;
}

export function ScrollTextReveal({
  text,
  className = "",
  as: Tag = "p",
  staggerDelay = 0.02,
}: ScrollTextRevealProps) {
  const { hydrated, motionEnabled } = useMotionPreference();
  const enableMotion = hydrated && motionEnabled;
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.9", "start 0.35"],
  });

  if (!enableMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  const words = text.split(" ");

  return (
    <div ref={containerRef}>
      <Tag className={className}>
        {words.map((word, i) => (
          <RevealWord
            key={`${word}-${i}`}
            word={word}
            index={i}
            total={words.length}
            progress={scrollYProgress}
            staggerDelay={staggerDelay}
          />
        ))}
      </Tag>
    </div>
  );
}

function RevealWord({
  word,
  index,
  total,
  progress,
  staggerDelay,
}: {
  word: string;
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  staggerDelay: number;
}) {
  const start = Math.min(index * staggerDelay, 0.6);
  const end = Math.min(start + 0.25 + (0.4 / total), 1);

  const opacity = useTransform(progress, [start, end], [0.1, 1]);
  const blur = useTransform(progress, [start, end], [6, 0]);
  const filter = useTransform(blur, (v) => (v < 0.2 ? "none" : `blur(${v}px)`));

  return (
    <>
      <motion.span
        className="inline-block"
        style={{ opacity, filter }}
      >
        {word}
      </motion.span>
      {" "}
    </>
  );
}
