"use client";

import { useCallback, useEffect, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { cn, scrollToId } from "@/lib/utils";
import { profile } from "@/data/profile";
import { NAV_LINKS } from "./nav-data";
import { ThemeToggle } from "./theme-toggle";
import { BrandMark } from "./brand-mark";

export function Nav() {
  const [active, setActive] = useState<string>("home");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scrollspy
  useEffect(() => {
    const ids = ["home", ...NAV_LINKS.map((l) => l.id)];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = useCallback((id: string) => {
    setOpen(false);
    scrollToId(id);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors",
        scrolled
          ? "border-b border-border-subtle bg-bg-main/80 backdrop-blur-xl"
          : "border-b border-transparent"
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        {/* Brand */}
        <button
          onClick={() => go("home")}
          className="group flex items-center gap-2.5 text-left"
          aria-label="Back to top"
        >
          <BrandMark className="h-[26px] w-[26px] rounded-lg shadow-soft transition-all duration-300 group-hover:scale-105 group-hover:shadow-glow" />
          <span className="mono text-sm font-medium tracking-tight text-text-primary">
            amir<span className="text-text-faint">.</span>shetaia
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => go(link.id)}
              className={cn(
                "mono relative rounded-md px-2.5 py-1.5 text-xs tracking-wide transition-colors",
                active === link.id
                  ? "text-accent"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {link.label}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-2.5 bottom-[3px] h-px origin-left bg-accent transition-transform duration-300 ease-out",
                  active === link.id ? "scale-x-100" : "scale-x-0"
                )}
              />
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-9 items-center gap-1.5 rounded-lg border border-border-subtle px-3 text-xs font-medium text-text-primary transition-colors hover:border-accent hover:text-accent sm:inline-flex"
          >
            résumé
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-secondary transition-colors hover:border-accent hover:text-accent md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open ? (
        <div className="border-t border-border-subtle bg-bg-main/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-1 px-4 py-4 sm:px-6">
            {NAV_LINKS.map((link, i) => (
              <button
                key={link.id}
                onClick={() => go(link.id)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
              >
                <span className="num text-xs text-text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {link.label}
              </button>
            ))}
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-2 mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-border-subtle px-3 py-2.5 text-sm font-medium text-text-primary"
            >
              résumé <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
