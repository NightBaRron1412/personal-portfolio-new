"use client";

import { useState } from "react";
import { profile } from "@/data/profile";
import { Section } from "./section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { motion } from "framer-motion";
import { useMotionPreference } from "../motion-provider";

const categories = [
  { key: "Languages", label: "Languages" },
  { key: "Firmware and Embedded", label: "Firmware & Embedded" },
  { key: "Protocols and Standards", label: "Protocols & Standards" },
  { key: "Cloud and DevOps", label: "Cloud & DevOps" },
  { key: "System Design", label: "System Design" },
  { key: "Debug and Tools", label: "Debug & Tools" },
  { key: "AI and ML", label: "AI & ML" }
] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
};

function getRipplePillVariant(index: number, total: number) {
  const center = Math.floor(total / 2);
  const distFromCenter = Math.abs(index - center);
  const delay = distFromCenter * 0.04;
  return {
    hidden: { opacity: 0, scale: 0.3, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 18,
        mass: 0.6,
        delay,
      },
    },
  };
}

export function Skills() {
  const { hydrated, motionEnabled } = useMotionPreference();
  const enableMotion = hydrated && motionEnabled;
  const [hasAnimated, setHasAnimated] = useState(false);

  const shouldAnimate = enableMotion && !hasAnimated;

  return (
    <Section id="skills" className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-text-secondary">Skills</p>
        <h2>Technologies and expertise across systems, HPC, and ML</h2>
      </div>
      <Tabs defaultValue="Languages">
        <div className="overflow-x-auto pb-2">
          <TabsList className="min-w-max gap-2">
            {categories.map((category) => (
              <TabsTrigger key={category.key} value={category.key} className="min-w-fit text-xs sm:text-sm px-2 sm:px-3">
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {categories.map((category) => (
          <TabsContent key={category.key} value={category.key}>
            <motion.div
              className="flex flex-wrap gap-2 sm:gap-3"
              {...(shouldAnimate ? {
                variants: containerVariants,
                initial: "hidden" as const,
                animate: "visible" as const,
                onAnimationComplete: () => { setHasAnimated(true); },
              } : {})}
            >
              {profile.skills[category.key]?.map((skill, i, arr) => (
                <motion.div
                  key={skill.name}
                  {...(shouldAnimate ? {
                    variants: getRipplePillVariant(i, arr.length),
                  } : {})}
                  className="group relative overflow-hidden rounded-full border border-border-subtle bg-bg-elevated px-4 py-2 text-sm text-text-primary shadow-soft transition hover:-translate-y-1 hover:shadow-glow"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/20 via-accent-pink/20 to-accent-purple/25 opacity-0 transition duration-500 group-hover:opacity-100" />
                  <span className="relative z-10">{skill.name}</span>
                </motion.div>
              )) ?? null}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </Section>
  );
}
