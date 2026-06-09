"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

/**
 * Adapted from the Aceternity "Animated Testimonials" component (as featured on
 * 21st.dev) — retargeted to framer-motion, lucide icons, and the instrument
 * theme tokens, with deterministic rotation (no hydration mismatch).
 */
export function AnimatedTestimonials({
  testimonials,
  autoplay = true,
}: {
  testimonials: Testimonial[];
  autoplay?: boolean;
}) {
  const [active, setActive] = useState(0);

  const handleNext = () => setActive((p) => (p + 1) % testimonials.length);
  const handlePrev = () => setActive((p) => (p - 1 + testimonials.length) % testimonials.length);
  const isActive = (i: number) => i === active;

  // Restart the autoplay timer whenever the active slide changes (including
  // manual next/prev/dot), so a manual click always gets a full interval and
  // never double-advances.
  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(handleNext, 5500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, active]);

  // deterministic tilt per card (avoids SSR/client mismatch)
  const tiltFor = (i: number) => (i % 3) * 4 - 4;

  return (
    <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-14">
      {/* stacked portraits */}
      <div className="relative mx-auto h-72 w-full max-w-xs sm:h-80">
        <AnimatePresence>
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, scale: 0.92, z: -100, rotate: tiltFor(index) }}
              animate={{
                opacity: isActive(index) ? 1 : 0.55,
                scale: isActive(index) ? 1 : 0.94,
                z: isActive(index) ? 0 : -100,
                rotate: isActive(index) ? 0 : tiltFor(index),
                zIndex: isActive(index) ? 40 : testimonials.length + 2 - index,
                y: isActive(index) ? [0, -60, 0] : 0,
              }}
              exit={{ opacity: 0, scale: 0.92, z: 100, rotate: tiltFor(index) }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 origin-bottom"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.src}
                alt={t.name}
                draggable={false}
                loading="lazy"
                className="h-full w-full rounded-2xl border border-border-subtle object-cover object-center"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* quote */}
      <div className="flex flex-col justify-between">
        <motion.div
          key={active}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <h3 className="font-display text-xl font-semibold text-text-primary">
            {testimonials[active].name}
          </h3>
          <p className="mono mt-1 text-xs text-text-faint">{testimonials[active].designation}</p>
          <motion.p className="mt-6 text-base leading-relaxed text-text-secondary">
            {testimonials[active].quote.split(" ").map((word, index) => (
              <motion.span
                key={index}
                initial={{ filter: "blur(8px)", opacity: 0, y: 4 }}
                animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: "easeInOut", delay: 0.015 * index }}
                className="inline-block"
              >
                {word}&nbsp;
              </motion.span>
            ))}
          </motion.p>
        </motion.div>

        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={handlePrev}
            aria-label="Previous testimonial"
            className="group/btn flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle text-text-secondary transition-colors hover:border-accent hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover/btn:-translate-x-0.5" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next testimonial"
            className="group/btn flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle text-text-secondary transition-colors hover:border-accent hover:text-accent"
          >
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
          </button>
          <div className="ml-2 flex gap-1.5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={
                  "h-1.5 rounded-full transition-all " +
                  (isActive(i) ? "w-5 bg-accent" : "w-1.5 bg-border-strong hover:bg-text-faint")
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
