"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import { useMotionPreference } from "./motion-provider";
import { Navbar } from "./components/navbar";
import { Hero } from "./components/hero";
import { About } from "./components/about";
import { Skills } from "./components/skills";
import { Experience } from "./components/experience";
import { Projects } from "./components/projects";
import { Education } from "./components/education";
import { Testimonials } from "./components/testimonials";
import { Contact } from "./components/contact";
import { Footer } from "./components/footer";
import { GitHubActivity } from "./components/github-activity";
import { SpotifyNowPlaying } from "./components/spotify-now-playing";
import { CommandPalette } from "./components/command-palette";
import { CursorGlow } from "./components/cursor-glow";
import { ProgressBar } from "./components/progress-bar";
import { Button } from "./components/ui/button";
import { Section } from "./components/section";
import { LoadingScreen } from "./components/loading-screen";
import { SectionConnector, ConnectorCanvas } from "./components/section-connector";
import { EasterEggs } from "./components/easter-eggs";

export default function HomePage() {
  const { hydrated, motionEnabled } = useMotionPreference();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [glowEnabled, setGlowEnabled] = useState(true);
  const [showTop, setShowTop] = useState(false);
  const [loading, setLoading] = useState<boolean | null>(null);
  const [, setPartyMode] = useState(false);

  const enableMotion = hydrated && motionEnabled;

  useEffect(() => {
    if (!hydrated) return;
    if (!motionEnabled) { setLoading(false); return; }
    try {
      if (sessionStorage.getItem("boot-done") === "true") {
        setLoading(false);
        return;
      }
    } catch { /* ignore */ }
    setLoading(true);
  }, [hydrated, motionEnabled]);

  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("cursor-glow");
    } catch { /* ignore */ }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const computed = stored !== null ? stored === "true" : !prefersReduced && !isMobile;
    setGlowEnabled(computed);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const reduceListener = (event: MediaQueryListEvent) => {
      if (event.matches) setGlowEnabled(false);
    };
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    mql.addEventListener("change", reduceListener);
    return () => mql.removeEventListener("change", reduceListener);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("cursor-glow", glowEnabled ? "true" : "false");
  }, [glowEnabled]);

  const handleToggleGlow = () => {
    if (!motionEnabled) {
      setGlowEnabled(false);
      return;
    }
    setGlowEnabled((value) => !value);
  };

  const handleLoadingComplete = useCallback(() => {
    setLoading(false);
    try { sessionStorage.setItem("boot-done", "true"); } catch { /* ignore */ }
  }, []);

  const handlePartyMode = useCallback(() => {
    setPartyMode(true);
    setTimeout(() => setPartyMode(false), 3000);
  }, []);

  const showContent = loading === false;

  return (
    <>
      {loading === true && mounted && createPortal(
        <LoadingScreen onComplete={handleLoadingComplete} />,
        document.body
      )}
      {!showContent ? (
        <div style={{ visibility: "hidden", height: 0, overflow: "hidden" }} aria-hidden />
      ) : (
    <ConnectorCanvas>
    <motion.main
      className="home-page-bg relative min-h-screen bg-bg-main"
      initial={!enableMotion ? false : { opacity: 0 }}
      animate={!enableMotion ? {} : { opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <CursorGlow enabled={glowEnabled} />
      <Navbar onOpenCommand={() => setPaletteOpen(true)} glowEnabled={glowEnabled} onToggleGlow={handleToggleGlow} />
      <ProgressBar />
      <EasterEggs onPartyMode={handlePartyMode} />
      <div aria-hidden className="h-[72px]" />

      <motion.div
        className="relative z-10 mx-auto max-w-6xl px-4 pb-0 sm:px-6 sm:pb-0 lg:px-8 lg:pb-0"
        key={enableMotion ? "motion" : "static"}
        variants={!enableMotion ? undefined : pageVariants}
        initial={!enableMotion ? false : "hidden"}
        animate={!enableMotion ? undefined : "visible"}
      >
        <Section id="home" className="pt-12 sm:pt-16 lg:pt-20">
          <Hero />
        </Section>
        <SectionConnector label="About" />
        <About />
        <SectionConnector label="Skills" />
        <Skills />
        <SectionConnector label="Experience" />
        <Experience />
        <SectionConnector label="Projects" />
        <Projects />
        <SectionConnector label="GitHub" />
        <GitHubActivity />
        <SectionConnector label="Education" />
        <Education />
        <SectionConnector label="Testimonials" />
        <Testimonials />
        <SectionConnector label="Contact" />
        <Contact />
        <Footer />
      </motion.div>

      {mounted && showTop
        ? createPortal(
            <Button
              className="fixed bottom-6 right-6 z-[999] shadow-glow"
              size="icon"
              variant="secondary"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>,
            document.body
          )
        : null}
      {mounted && createPortal(<SpotifyNowPlaying />, document.body)}
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </motion.main>
    </ConnectorCanvas>
      )}
    </>
  );
}
