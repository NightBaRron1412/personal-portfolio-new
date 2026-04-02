"use client";

import Image from "next/image";
import { useState, useEffect, useRef, type TouchEvent } from "react";
import { profile } from "@/data/profile";
import { Section } from "./section";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMotionPreference } from "../motion-provider";

function TypingQuote({ text, active, onDone }: { text: string; active: boolean; onDone?: () => void }) {
  const { hydrated, motionEnabled } = useMotionPreference();
  const enableMotion = hydrated && motionEnabled;
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!active || !enableMotion) {
      setDisplayed(text);
      setDone(true);
      onDoneRef.current?.();
      return;
    }

    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
        onDoneRef.current?.();
      }
    }, 12);
    return () => clearInterval(interval);
  }, [text, active, enableMotion]);

  return (
    <span className="block">
      &quot;{displayed}&quot;
      {!done && enableMotion && (
        <span className="inline-block w-[2px] h-5 bg-accent-blue/80 ml-0.5 animate-pulse align-text-bottom" />
      )}
    </span>
  );
}

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const { hydrated, motionEnabled } = useMotionPreference();
  const enableMotion = hydrated && motionEnabled;
  const testimonials = profile.testimonials;

  const next = () => { setDirection(1); setIndex((prev) => (prev + 1) % testimonials.length); };
  const prev = () => { setDirection(-1); setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length); };

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [paused, setPaused] = useState(false);
  const [typingDone, setTypingDone] = useState(false);

  const clearTimer = () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };

  // When typing finishes, wait 5 seconds then advance (unless paused)
  useEffect(() => {
    clearTimer();
    if (!typingDone || paused) return;
    timerRef.current = setTimeout(next, 5000);
    return clearTimer;
  }, [typingDone, paused]);

  // Reset typing state when slide changes
  useEffect(() => { setTypingDone(false); }, [index]);

  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setTouchStart(event.touches[0].clientX);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStart === null) return;
    const diff = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 60) {
      diff > 0 ? prev() : next();
    }
    setTouchStart(null);
  };

  const testimonial = testimonials[index];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 250, damping: 25 },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 },
    }),
  };

  return (
    <Section id="testimonials" className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-text-secondary">
            Testimonials
          </p>
          <h2>What teammates say</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="subtle"
            size="icon"
            onClick={prev}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-4 w-4" suppressHydrationWarning />
          </Button>
          <Button
            variant="subtle"
            size="icon"
            onClick={next}
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-4 w-4" suppressHydrationWarning />
          </Button>
        </div>
      </div>
      <div
        className="section-card relative overflow-hidden p-6"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="absolute inset-0 bg-gradient-to-br from-accent-purple/15 via-transparent to-accent-blue/15"
          aria-hidden
        />
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={enableMotion ? slideVariants : undefined}
            initial={enableMotion ? "enter" : false}
            animate={enableMotion ? "center" : undefined}
            exit={enableMotion ? "exit" : undefined}
            className="relative flex flex-col gap-4 md:flex-row md:items-center"
          >
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-2 border-border-subtle">
              <Image
                src={testimonial.avatar}
                alt={testimonial.name}
                width={96}
                height={96}
                className="object-cover"
                suppressHydrationWarning
              />
            </div>
            <div className="space-y-3">
              <p className="text-lg text-text-primary sm:text-xl">
                <TypingQuote text={testimonial.quote} active={true} onDone={() => setTypingDone(true)} />
              </p>
              <p className="text-sm text-text-secondary">
                {testimonial.name} | {testimonial.title}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </Section>
  );
}
