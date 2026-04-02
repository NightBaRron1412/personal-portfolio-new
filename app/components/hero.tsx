"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Github, Linkedin, Mail } from "lucide-react";
import { profile } from "@/data/profile";
import { scrollToId } from "@/lib/utils";
import { Portrait } from "./portrait";
import { Magnetic } from "./magnetic";
import { useMotionPreference } from "../motion-provider";
import { InteractiveTerminal } from "./interactive-terminal";

export function Hero() {
  const { hydrated, motionEnabled } = useMotionPreference();
  const enableMotion = hydrated && motionEnabled;

  const gradient = useMemo(
    () => ({
      background:
        "linear-gradient(120deg, color-mix(in srgb, var(--accent-blue) 35%, transparent), color-mix(in srgb, var(--accent-pink) 30%, transparent), color-mix(in srgb, var(--accent-purple) 25%, transparent))",
      backgroundSize: "200% 200%"
    }),
    []
  );

  const ctaHover = !enableMotion ? undefined : { y: -4, scale: 1.01 };
  const ctaTransition = { type: "spring", stiffness: 360, damping: 24, mass: 0.35 } as const;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-secondary/80 px-6 py-10 shadow-soft sm:px-8">
      <div className="absolute inset-0 animate-gradient opacity-80 dark:opacity-100" style={gradient} aria-hidden />
      <div className="absolute inset-0 animate-noise opacity-20 dark:opacity-50 sm:dark:opacity-60" aria-hidden />
      <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6 lg:max-w-xl">
          <h1>Hi, I&apos;m {profile.name}</h1>
          <p className="text-base text-text-secondary sm:text-lg">{profile.title}</p>
          
          <InteractiveTerminal />

          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Magnetic className="w-full sm:w-auto">
                <motion.div whileHover={ctaHover} transition={ctaTransition}>
                  <Button
                    size="lg"
                    className="w-full hover:translate-y-0 sm:w-auto"
                    onClick={() => scrollToId("projects")}
                  >
                    View Projects
                  </Button>
                </motion.div>
              </Magnetic>
              <Magnetic className="w-full sm:w-auto">
                <motion.div whileHover={ctaHover} transition={ctaTransition}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full hover:translate-y-0 sm:w-auto"
                    onClick={() => scrollToId("contact")}
                  >
                    Contact Me
                  </Button>
                </motion.div>
              </Magnetic>
            </div>
            <div className="flex items-center gap-2 text-text-secondary sm:gap-3">
              <Magnetic>
                <Button asChild variant="ghost" size="icon" aria-label="GitHub" className="rounded-full border border-border-subtle">
                  <a href={profile.social.github} className="flex h-full w-full items-center justify-center" target="_blank" rel="noreferrer">
                    <Github className="h-5 w-5" suppressHydrationWarning />
                  </a>
                </Button>
              </Magnetic>
              <Magnetic>
                <Button asChild variant="ghost" size="icon" aria-label="LinkedIn" className="rounded-full border border-border-subtle">
                  <a href={profile.social.linkedin} className="flex h-full w-full items-center justify-center" target="_blank" rel="noreferrer">
                    <Linkedin className="h-5 w-5" suppressHydrationWarning />
                  </a>
                </Button>
              </Magnetic>
              <Magnetic>
                <Button asChild variant="ghost" size="icon" aria-label="Email Amir" className="rounded-full border border-border-subtle">
                  <a href={profile.social.email} className="flex h-full w-full items-center justify-center">
                    <Mail className="h-5 w-5" suppressHydrationWarning />
                  </a>
                </Button>
              </Magnetic>
            </div>
          </div>
        </div>
        <div className="order-first flex justify-center lg:order-last">
          <Portrait />
        </div>
      </div>
    </div>
  );
}
