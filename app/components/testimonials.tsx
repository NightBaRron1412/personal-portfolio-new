"use client";

import { profile } from "@/data/profile";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { Reveal } from "./reveal";

export function Testimonials() {
  const items = profile.testimonials.map((t) => ({
    quote: t.quote,
    name: t.name,
    designation: t.title,
    src: t.avatar,
  }));

  return (
    <Reveal>
      <div className="panel glow-border ticks p-6 sm:p-10">
        <AnimatedTestimonials testimonials={items} autoplay />
      </div>
    </Reveal>
  );
}
