"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { MotionConfig } from "framer-motion";

type MotionPreference = {
  hydrated: boolean;
  motionEnabled: boolean;
  setMotionEnabled: (value: boolean) => void;
  toggleMotion: () => void;
};

const MotionPreferenceContext = createContext<MotionPreference | null>(null);

export function MotionProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [preference, setPreference] = useState<boolean | null>(null);
  const [systemReduced, setSystemReduced] = useState(false);
  const motionEnabled = preference ?? !systemReduced;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setSystemReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    try {
      const stored = localStorage.getItem("motion-enabled");
      if (stored === "true" || stored === "false") setPreference(stored === "true");
    } catch { /* Storage is optional. */ }
    setHydrated(true);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (preference === null) document.documentElement.removeAttribute("data-force-motion");
    else document.documentElement.setAttribute("data-force-motion", String(preference));
  }, [hydrated, preference]);

  const value = useMemo<MotionPreference>(() => {
    const setMotionEnabled = (enabled: boolean) => {
      setPreference(enabled);
      try { localStorage.setItem("motion-enabled", String(enabled)); } catch { /* Optional. */ }
    };
    return {
      hydrated,
      motionEnabled,
      setMotionEnabled,
      toggleMotion: () => setMotionEnabled(!motionEnabled),
    };
  }, [hydrated, motionEnabled]);

  return (
    <MotionPreferenceContext.Provider value={value}>
      <MotionConfig reducedMotion={motionEnabled ? "never" : "always"}>
        {children}
      </MotionConfig>
    </MotionPreferenceContext.Provider>
  );
}

export function useMotionPreference(): MotionPreference {
  const ctx = useContext(MotionPreferenceContext);
  if (!ctx) {
    throw new Error("useMotionPreference must be used within <MotionProvider />");
  }
  return ctx;
}
