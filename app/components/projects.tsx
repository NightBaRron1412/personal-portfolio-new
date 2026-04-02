"use client";

import { useState, useRef } from "react";
import { profile } from "@/data/profile";
import { Section } from "./section";
import { ProjectCard } from "./project-card";
import { ProjectModal } from "./project-modal";
import { motion, useInView } from "framer-motion";
import { useMotionPreference } from "../motion-provider";

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } }
};

function getDealVariant(index: number) {
  const stackOffset = (index + 1) * 8;
  return {
    hidden: {
      opacity: 0,
      y: -stackOffset,
      scale: 0.88,
      rotateZ: (index % 2 === 0 ? -1 : 1) * (3 + index * 1.5),
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateZ: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 22,
        mass: 0.7,
      },
    },
  };
}

export function Projects() {
  const [activeProject, setActiveProject] = useState<any | null>(null);
  const featured = profile.projects.filter((p) => p.featured);
  const rest = profile.projects.filter((p) => !p.featured);
  const { hydrated, motionEnabled } = useMotionPreference();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const enableMotion = hydrated && motionEnabled;

  return (
    <Section id="projects" className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-text-secondary">Projects</p>
        <h2>Building systems that last</h2>
      </div>
      <motion.div
        ref={ref}
        className="grid gap-4 md:grid-cols-2"
        key={`projects-featured-${enableMotion ? "m" : "s"}`}
        variants={enableMotion ? gridVariants : undefined}
        initial={enableMotion ? "hidden" : false}
        animate={enableMotion && inView ? "visible" : {}}
      >
        {featured.map((project, i) => (
          <motion.div key={project.title} variants={enableMotion ? getDealVariant(i) : undefined}>
            <ProjectCard project={project} featured onOpen={setActiveProject} />
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        key={`projects-rest-${enableMotion ? "m" : "s"}`}
        variants={enableMotion ? gridVariants : undefined}
        initial={enableMotion ? "hidden" : false}
        animate={enableMotion && inView ? "visible" : {}}
      >
        {rest.map((project, i) => (
          <motion.div key={project.title} variants={enableMotion ? getDealVariant(i + featured.length) : undefined}>
            <ProjectCard project={project} onOpen={setActiveProject} />
          </motion.div>
        ))}
      </motion.div>
      <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
    </Section>
  );
}
