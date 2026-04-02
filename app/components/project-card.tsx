"use client";

import Image from "next/image";
import { PointerEvent, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { Github, Link } from "lucide-react";
import { Button } from "./ui/button";
import { useMotionPreference } from "../motion-provider";

interface ProjectCardProps {
  project: any;
  onOpen: (project: any) => void;
  featured?: boolean;
}

export function ProjectCard({ project, onOpen, featured }: ProjectCardProps) {
  const { hydrated, motionEnabled } = useMotionPreference();
  const enableMotion = hydrated && motionEnabled;
  const cardRef = useRef<HTMLDivElement | null>(null);

  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);
  const tiltX = useTransform(pointerY, [0, 100], [7, -7]);
  const tiltY = useTransform(pointerX, [0, 100], [-7, 7]);
  const springTiltX = useSpring(tiltX, { stiffness: 260, damping: 22, mass: 0.5 });
  const springTiltY = useSpring(tiltY, { stiffness: 260, damping: 22, mass: 0.5 });
  const glow = useMotionTemplate`radial-gradient(220px circle at ${pointerX}% ${pointerY}%, color-mix(in srgb, var(--accent-blue) 30%, transparent), transparent 70%)`;

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!enableMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    pointerX.set(Math.max(0, Math.min(100, x)));
    pointerY.set(Math.max(0, Math.min(100, y)));
  };

  const resetTilt = () => {
    pointerX.set(50);
    pointerY.set(50);
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "group relative h-full cursor-pointer overflow-hidden rounded-2xl border border-border-subtle bg-bg-elevated p-4 shadow-soft transition hover:-translate-y-1 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue",
        featured && "glass-panel"
      )}
      onClick={() => onOpen(project)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen(project);
      }}
      onPointerMove={onPointerMove}
      onPointerLeave={resetTilt}
      onPointerCancel={resetTilt}
      role="button"
      aria-label={`Open details for ${project.title}`}
      style={
        !enableMotion
          ? undefined
          : {
              rotateX: springTiltX,
              rotateY: springTiltY,
              transformPerspective: 900,
              transformStyle: "preserve-3d",
            }
      }
      whileHover={!enableMotion ? undefined : { y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 280, damping: 20 }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={!enableMotion ? undefined : { background: glow }}
      />

      <div className="relative overflow-hidden rounded-xl border border-border-subtle">
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={project.images[0]}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="rounded-xl object-cover transition duration-500 group-hover:scale-105"
            priority={featured}
            suppressHydrationWarning
          />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-text-primary">{project.title}</h3>
          <Badge className="bg-accent-blue/15 text-xs text-text-primary">{project.role}</Badge>
        </div>
        <p className="text-sm text-text-secondary sm:text-base">{project.description}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {project.tech.map((tech: string) => (
            <Badge key={tech} className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {project.repo ? (
            <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
              <a href={project.repo} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-text-secondary hover:text-text-primary">
                <Github className="h-4 w-4" suppressHydrationWarning /> Code
              </a>
            </Button>
          ) : null}
          {project.demo ? (
            <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
              <a href={project.demo} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-text-secondary hover:text-text-primary">
                <Link className="h-4 w-4" suppressHydrationWarning /> Demo
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
