"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Briefcase } from "lucide-react";
import { profile } from "@/data/profile";
import { useMotionPreference } from "../motion-provider";

export function Portrait() {
  const [imageError, setImageError] = useState(false);
  const { hydrated, motionEnabled } = useMotionPreference();
  const enableMotion = hydrated && motionEnabled;

  const floatingAnimation = !enableMotion
    ? {}
    : {
        y: [0, -4, 0],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }
      };

  // Fallback avatar component
  const FallbackAvatar = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent-purple via-accent-pink to-accent-blue">
      <span className="text-6xl font-bold text-white">AS</span>
    </div>
  );

  return (
    <motion.div
      className="relative flex items-center justify-center"
      key={enableMotion ? "portrait-motion" : "portrait-static"}
      animate={floatingAnimation}
    >
      {/* Glow background */}
      <div className="absolute inset-0 -z-10 scale-110 opacity-30 blur-3xl dark:opacity-20">
        <div className="h-full w-full rounded-full bg-gradient-to-br from-accent-purple via-accent-pink to-accent-blue" />
      </div>

      {/* Portrait container */}
      <div className="group relative" data-portrait>
        {/* Animated gradient ring */}
        <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-accent-blue via-accent-purple to-accent-pink opacity-60 blur-sm transition-all duration-500 group-hover:opacity-100 group-hover:blur-md dark:opacity-40 dark:group-hover:opacity-75" />
        
        {/* Inner ring */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-accent-purple via-accent-pink to-accent-blue opacity-0 transition-opacity duration-300 group-hover:opacity-60 dark:group-hover:opacity-40" />

        {/* Portrait frame */}
        <div className="relative aspect-[3/4] w-64 overflow-hidden rounded-2xl border-2 border-border-subtle bg-bg-elevated shadow-2xl transition-all duration-300 group-hover:-translate-y-2 sm:w-72 lg:w-80">
          {!imageError ? (
            <Image
              src={profile.portrait || "/images/portrait.webp"}
              alt="Portrait of Amir Shetaia"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 220px, (max-width: 1024px) 260px, 320px"
              priority
              onError={() => setImageError(true)}
              suppressHydrationWarning
            />
          ) : (
            <FallbackAvatar />
          )}
        </div>

        {/* Glass info card */}
        <motion.div
          className="absolute -bottom-4 left-1/2 w-[calc(100%-2rem)] -translate-x-1/2 rounded-xl border-2 border-border-subtle bg-bg-elevated/95 dark:bg-bg-elevated/80 p-3 shadow-xl backdrop-blur-lg transition-all duration-300 group-hover:bg-bg-elevated dark:group-hover:bg-bg-elevated/90 sm:p-4"
          key={enableMotion ? "info-motion" : "info-static"}
          initial={!enableMotion ? false : { opacity: 0, y: 10 }}
          animate={!enableMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="space-y-2">
            <div>
              <h3 className="text-base font-semibold text-gray-100 sm:text-lg">
                {profile.name}
              </h3>
              <p className="flex items-center gap-1 text-xs text-gray-200 sm:text-sm font-medium">
                <Briefcase className="h-3 w-3" suppressHydrationWarning />
                {profile.title.split("|")[0].trim()}
              </p>
              <p className="flex items-center gap-1 text-xs text-gray-200 font-medium">
                <MapPin className="h-3 w-3" suppressHydrationWarning />
                {profile.location}
              </p>
            </div>
            
            {/* Specialty chips */}
            <div className="flex flex-wrap gap-1.5">
              {profile.portraitBadges?.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full bg-gradient-to-r from-accent-blue/30 to-accent-purple/30 dark:from-accent-blue/20 dark:to-accent-purple/20 px-2 py-0.5 text-xs font-semibold text-gray-100 ring-1 ring-accent-blue/40 dark:ring-accent-blue/30"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
