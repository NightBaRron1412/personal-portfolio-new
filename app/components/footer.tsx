"use client";

import { ArrowUp, Github, Linkedin, Mail } from "lucide-react";
import { profile } from "@/data/profile";
import { scrollToId } from "@/lib/utils";
import { NAV_LINKS } from "./nav-data";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border-subtle pt-12">
      <div className="flex flex-col gap-10 pb-10 md:flex-row md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="mono text-sm font-medium text-text-primary">amir.shetaia</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            {profile.title}. Building reliable, fast, well-measured systems.
          </p>
          <div className="mt-4 flex items-center gap-1">
            <a
              href={profile.social.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-elevated hover:text-accent"
            >
              <Github className="h-[18px] w-[18px]" />
            </a>
            <a
              href={profile.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-elevated hover:text-accent"
            >
              <Linkedin className="h-[18px] w-[18px]" />
            </a>
            <a
              href={profile.social.email}
              aria-label="Email"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-elevated hover:text-accent"
            >
              <Mail className="h-[18px] w-[18px]" />
            </a>
          </div>
        </div>

        <nav className="grid grid-cols-2 gap-x-10 gap-y-2 sm:grid-cols-3">
          {NAV_LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollToId(l.id)}
              className="mono text-left text-xs text-text-secondary transition-colors hover:text-accent"
            >
              {l.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex flex-col items-start justify-between gap-3 border-t border-border-subtle py-6 sm:flex-row sm:items-center">
        <p className="mono text-xs text-text-faint">
          © {year} Amir Shetaia · built with Next.js + Tailwind
        </p>
        <button
          onClick={() => scrollToId("home")}
          className="mono inline-flex items-center gap-1.5 text-xs text-text-secondary transition-colors hover:text-accent"
        >
          back to top <ArrowUp className="h-3.5 w-3.5" />
        </button>
      </div>
    </footer>
  );
}
