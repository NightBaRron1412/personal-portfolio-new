"use client";

import { profile } from "@/data/profile";
import { Marquee } from "@/components/ui/marquee";
import { Logo } from "./logo";
import { Reveal } from "./reveal";

// unique orgs (experience + schools), preserving order
const ORGS = (() => {
  const seen = new Set<string>();
  const list: { name: string; logo?: string }[] = [];
  for (const job of profile.experience) {
    if (!seen.has(job.company)) {
      seen.add(job.company);
      list.push({ name: job.company, logo: job.logo });
    }
  }
  for (const d of profile.education.degrees) {
    if (!seen.has(d.school)) {
      seen.add(d.school);
      list.push({ name: d.school, logo: d.logo });
    }
  }
  return list;
})();

export function WorkedAt() {
  return (
    <Reveal>
      <div className="py-8">
        <p className="eyebrow mb-5 text-center">worked at · studied at</p>
        <div className="relative overflow-hidden">
          <Marquee pauseOnHover className="[--duration:34s] py-0">
            {ORGS.map((o) => (
              <div
                key={o.name}
                className="mx-2 flex items-center gap-2.5 rounded-lg border border-border-subtle bg-surface px-3 py-2"
              >
                <Logo src={o.logo} name={o.name} className="h-8 w-8 shrink-0" />
                <span className="mono whitespace-nowrap text-xs text-text-secondary">{o.name}</span>
              </div>
            ))}
          </Marquee>
          {/* Slide-under edges — softened (quick ramp to transparent) so they
              aren't a harsh solid black/white block. */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-bg-main via-bg-main/50 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-bg-main via-bg-main/50 to-transparent" />
        </div>
      </div>
    </Reveal>
  );
}
