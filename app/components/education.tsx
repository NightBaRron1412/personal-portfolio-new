"use client";

import { Award, GraduationCap, Users } from "lucide-react";
import { profile } from "@/data/profile";
import { Logo } from "./logo";
import { Reveal } from "./reveal";

export function Education() {
  const { degrees, awards } = profile.education;
  const community = profile.community;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Degrees */}
      <div className="space-y-4">
        {degrees.map((d, i) => (
          <Reveal key={d.school} delay={i * 70}>
            <div className="panel glow-border lift ticks p-5">
              <div className="flex items-start gap-4">
                <Logo src={d.logo} name={d.school} className="h-11 w-11 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base leading-snug">{d.degree}</h3>
                    <span className="num shrink-0 text-xs text-text-faint">{d.year}</span>
                  </div>
                  <a
                    href={d.schoolUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono text-xs text-text-secondary transition-colors hover:text-accent"
                  >
                    {d.school}
                  </a>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent-soft px-2 py-0.5">
                    <GraduationCap className="h-3.5 w-3.5 text-accent" />
                    <span className="num text-xs text-accent">GPA {d.gpa}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">{d.details}</p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Awards + community */}
      <div className="space-y-4">
        <Reveal delay={80}>
          <div className="panel p-5">
            <div className="mb-4 flex items-center gap-2">
              <Award className="h-4 w-4 text-accent" />
              <h3 className="text-base">Awards &amp; Honors</h3>
            </div>
            <ul className="space-y-3">
              {awards.map((a) => (
                <li key={a.title} className="border-t border-border-subtle pt-3 first:border-t-0 first:pt-0">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium text-text-primary">{a.title}</span>
                    <span className="num shrink-0 text-xs text-text-faint">{a.year}</span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">{a.details}</p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <div className="panel p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-accent" />
              <h3 className="text-base">Community</h3>
            </div>
            <ul className="space-y-3">
              {community.map((c) => (
                <li key={c.organization} className="border-t border-border-subtle pt-3 first:border-t-0 first:pt-0">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium text-text-primary">{c.role}</span>
                    <span className="num shrink-0 text-xs text-text-faint">{c.year}</span>
                  </div>
                  <a
                    href={c.organizationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono text-xs text-text-secondary transition-colors hover:text-accent"
                  >
                    {c.organization}
                  </a>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">{c.details}</p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
