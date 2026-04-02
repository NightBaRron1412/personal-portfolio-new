"use client";

import { type CSSProperties, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Moon, Sun, Command, Sparkles, Menu, X, Activity } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { Button } from "./ui/button";
import { cn, scrollToId } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { Magnetic } from "./magnetic";
import { useMotionPreference } from "../motion-provider";

const sections = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "github", label: "GitHub" },
  { id: "education", label: "Education" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact", label: "Contact" }
];

interface NavbarProps {
  onOpenCommand: () => void;
  glowEnabled: boolean;
  onToggleGlow: () => void;
}

export function Navbar({ onOpenCommand, glowEnabled, onToggleGlow }: NavbarProps) {
  const { theme, setTheme, systemTheme } = useTheme();
  const { motionEnabled, toggleMotion } = useMotionPreference();
  const [active, setActive] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavVisible, setMobileNavVisible] = useState(true);
  const [mobileAutoHideEnabled, setMobileAutoHideEnabled] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    let ticking = false;

    const updateActive = () => {
      const orderedSections = sections
        .map((section) => document.getElementById(section.id))
        .filter((el): el is HTMLElement => Boolean(el))
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return { id: el.id, top: rect.top, bottom: rect.bottom };
        })
        .sort((a, b) => a.top - b.top);

      if (!orderedSections.length) return;

      const anchor = window.innerWidth < 768 ? 108 : 128;
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

      if (isAtBottom) {
        const last = orderedSections[orderedSections.length - 1]?.id;
        if (last) setActive((prev) => (prev === last ? prev : last));
        return;
      }

      let current = orderedSections[0]?.id ?? "home";
      for (let index = 0; index < orderedSections.length; index++) {
        const section = orderedSections[index];
        if (section.top <= anchor && section.bottom > anchor) {
          current = section.id;
          break;
        }

        if (section.top > anchor) {
          current = index === 0 ? section.id : orderedSections[index - 1]!.id;
          break;
        }

        if (index === orderedSections.length - 1) {
          current = section.id;
        }
      }

      setActive((prev) => (prev === current ? prev : current));
    };

    const queueUpdate = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateActive();
        ticking = false;
      });
    };

    queueUpdate();
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);

    return () => {
      window.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
    };
  }, []);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 1024) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", closeOnResize, { passive: true });
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobileAutoHideEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    const threshold = 10;
    const topOffset = 80;

    const handleScroll = () => {
      const y = window.scrollY;

      // Keep desktop behavior unchanged.
      // Desktop/tablet widths should always keep navbar visible.
      if (!mobileAutoHideEnabled || menuOpen) {
        setMobileNavVisible(true);
        lastY = y;
        return;
      }

      const delta = y - lastY;
      if (y <= topOffset) {
        setMobileNavVisible(true);
      } else if (delta > threshold) {
        setMobileNavVisible(false);
      } else if (delta < -threshold) {
        setMobileNavVisible(true);
      }

      lastY = y;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [menuOpen, mobileAutoHideEnabled]);

  const handleNavigate = (id: string) => {
    scrollToId(id);
    setMenuOpen(false);
  };

  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const isDark = (resolvedTheme ?? "dark") === "dark";
  const mobileMenuVars = (isDark
    ? {
        "--text-primary": "#ffffff",
        "--text-secondary": "rgba(255,255,255,0.86)",
        "--bg-elevated": "rgba(255,255,255,0.12)",
        "--border-subtle": "rgba(255,255,255,0.26)",
      }
    : {
        "--text-primary": "#111827",
        "--text-secondary": "rgba(17,24,39,0.74)",
        "--bg-elevated": "rgba(255,255,255,0.42)",
        "--border-subtle": "rgba(17,24,39,0.12)",
      }) as CSSProperties;

  const header = (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-border-subtle bg-bg-main/95 backdrop-blur-sm transition-transform duration-300 will-change-transform",
        !mobileAutoHideEnabled || mobileNavVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 text-sm font-semibold text-text-primary mr-2 sm:mr-4">
          <Image
            src="/images/logo.svg"
            alt="Amir Shetaia"
            width={36}
            height={36}
            className="rounded-lg flex-shrink-0"
            priority
            suppressHydrationWarning
          />
          <span className="whitespace-nowrap">Amir Shetaia</span>
        </div>
        <div className="hidden items-center gap-1 lg:flex">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleNavigate(section.id)}
              className={cn(
                "min-h-[44px] rounded-xl px-3 py-2 text-sm text-text-secondary transition hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue",
                active === section.id && "bg-bg-elevated text-text-primary"
              )}
            >
              {section.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Magnetic>
            <Button
              variant="subtle"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              <Sun className="hidden h-4 w-4 dark:block" suppressHydrationWarning />
              <Moon className="h-4 w-4 dark:hidden" suppressHydrationWarning />
            </Button>
          </Magnetic>
          <Magnetic>
            <Button
              variant="subtle"
              size="icon"
              aria-label="Toggle cursor glow"
              onClick={onToggleGlow}
              className="hidden md:inline-flex"
            >
              <Sparkles
                className={cn("h-4 w-4", glowEnabled ? "text-accent-pink" : "text-text-secondary")}
                suppressHydrationWarning
              />
            </Button>
          </Magnetic>
          <Magnetic>
            <Button
              variant="subtle"
              size="icon"
              aria-label={motionEnabled ? "Turn off animations" : "Turn on animations"}
              onClick={toggleMotion}
              className="hidden md:inline-flex"
              title={motionEnabled ? "Animations: On" : "Animations: Off"}
            >
              <Activity
                className={cn("h-4 w-4", motionEnabled ? "text-emerald-400" : "text-text-secondary")}
                suppressHydrationWarning
              />
            </Button>
          </Magnetic>
          <Magnetic>
            <Button
              variant="subtle"
              size="icon"
              aria-label={motionEnabled ? "Turn off animations" : "Turn on animations"}
              onClick={toggleMotion}
              className="sm:hidden"
            >
              <Activity
                className={cn("h-4 w-4", motionEnabled ? "text-emerald-400" : "text-text-secondary")}
                suppressHydrationWarning
              />
            </Button>
          </Magnetic>
          <Magnetic>
            <Button variant="outline" size="sm" onClick={onOpenCommand} className="hidden gap-2 sm:inline-flex">
              <Command className="h-4 w-4" suppressHydrationWarning />
              <span className="hidden md:inline">Command</span>
              <span className="rounded-md bg-bg-elevated px-1 text-xs text-text-secondary">Ctrl+K</span>
            </Button>
          </Magnetic>
          <Magnetic>
            <Button asChild size="sm" className="hidden px-3 py-1.5 text-xs lg:inline-flex">
              <a href="/Amir-Shetaia-Resume.pdf" download>
                Resume
              </a>
            </Button>
          </Magnetic>
          <Magnetic>
            <Button
              variant="subtle"
              size="icon"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <X className="h-5 w-5" suppressHydrationWarning />
              ) : (
                <Menu className="h-5 w-5" suppressHydrationWarning />
              )}
            </Button>
          </Magnetic>
        </div>
      </nav>
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent
          showCloseButton={false}
          style={mobileMenuVars}
          overlayClassName={isDark ? undefined : "bg-white/22 backdrop-blur-[5px]"}
          className={cn(
            "left-0 right-0 top-0 max-h-[85vh] w-full max-w-none translate-x-0 translate-y-0 rounded-b-2xl p-6 sm:left-auto sm:right-4 sm:top-4 sm:max-w-sm sm:rounded-2xl",
            isDark
              ? "border border-white/25 bg-slate-950/40 shadow-2xl backdrop-blur-[34px] backdrop-saturate-200 sm:border sm:border-border-subtle sm:bg-bg-secondary sm:backdrop-blur-none sm:backdrop-saturate-100"
              : "border border-white/70 bg-white/64 shadow-2xl backdrop-blur-[34px] backdrop-saturate-170 sm:border sm:border-border-subtle sm:bg-bg-secondary sm:backdrop-blur-none sm:backdrop-saturate-100"
          )}
        >
          <DialogTitle className="sr-only">Navigation Menu</DialogTitle>
          <DialogDescription className="sr-only">
            Navigate to sections of the portfolio and open quick actions.
          </DialogDescription>
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent-purple to-accent-pink shadow-glow" />
              <span>Navigate</span>
            </div>
            <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
              <X className="h-5 w-5" suppressHydrationWarning />
            </Button>
          </div>
          <div className="grid gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleNavigate(section.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border border-border-subtle bg-bg-elevated px-4 py-3 text-left text-sm text-text-primary transition hover:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue",
                  active === section.id && "border-accent-blue bg-accent-blue/10"
                )}
              >
                <span>{section.label}</span>
                {active === section.id ? <span className="h-2 w-2 rounded-full bg-accent-blue" aria-hidden /> : null}
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-3">
            <Button asChild className="w-full" size="lg">
              <a href="/Amir-Shetaia-Resume.pdf" download>
                Download Resume
              </a>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                onOpenCommand();
                setMenuOpen(false);
              }}
            >
              <Command className="mr-2 h-4 w-4" /> Command Palette
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );

  return portalReady ? createPortal(header, document.body) : header;
}
