"use client";

import { useRef } from "react";
import { profile } from "@/data/profile";
import { Section } from "./section";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { motion, useInView } from "framer-motion";
import { useMotionPreference } from "../motion-provider";

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } }
};

const flyInDirections = [
  { x: -60, y: -30, rotate: -8 },
  { x: 50, y: -40, rotate: 6 },
  { x: -40, y: 50, rotate: 5 },
  { x: 60, y: 30, rotate: -6 },
];

function getFlyInVariant(index: number) {
  const dir = flyInDirections[index % flyInDirections.length];
  return {
    hidden: { opacity: 0, x: dir.x, y: dir.y, scale: 0.85, rotate: dir.rotate },
    visible: {
      opacity: 1, x: 0, y: 0, scale: 1, rotate: 0,
      transition: { type: "spring", stiffness: 200, damping: 20, mass: 0.8 },
    },
  };
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 180, damping: 22 },
  },
};

export function About() {
  const { hydrated, motionEnabled } = useMotionPreference();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const enableMotion = hydrated && motionEnabled;

  return (
    <Section id="about" className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-text-secondary">About</p>
        <h2>Systems-minded engineer who loves resilient products</h2>
        <p className="max-w-3xl text-text-secondary">{profile.summary}</p>
      </div>
      <motion.div
        ref={ref}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        key={`about-grid-${enableMotion ? "m" : "s"}`}
        variants={enableMotion ? gridVariants : undefined}
        initial={enableMotion ? "hidden" : false}
        animate={enableMotion && inView ? "visible" : {}}
      >
        {profile.quickFacts.map((fact, i) => (
          <motion.div key={fact.label} variants={enableMotion ? getFlyInVariant(i) : undefined}>
            <Card className="transition-transform hover:-translate-y-1 hover:shadow-glow h-full">
              <CardHeader>
                <CardTitle className="text-sm text-text-secondary">{fact.label}</CardTitle>
                <div className="text-xl font-semibold text-text-primary">{fact.value}</div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        key={`about-now-${enableMotion ? "m" : "s"}`}
        variants={enableMotion ? cardVariants : undefined}
        initial={enableMotion ? "hidden" : false}
        animate={enableMotion && inView ? "visible" : {}}
      >
        <Card className="glass-panel transition-transform hover:-translate-y-1 hover:shadow-glow">
          <CardHeader>
            <CardTitle className="text-sm text-text-secondary">{profile.nowCard.title}</CardTitle>
            <div className="text-base leading-relaxed text-text-secondary sm:text-lg">
              <p className="max-h-32 overflow-hidden sm:max-h-none">{profile.nowCard.body}</p>
            </div>
          </CardHeader>
        </Card>
      </motion.div>
    </Section>
  );
}
