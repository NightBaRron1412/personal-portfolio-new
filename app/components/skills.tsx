"use client";

import { profile } from "@/data/profile";
import { Marquee } from "@/components/ui/marquee";
import { Reveal } from "./reveal";

const ALL_SKILLS = Object.values(profile.skills).flat().map((s) => s.name);
const HALF = Math.ceil(ALL_SKILLS.length / 2);
const ROW_A = ALL_SKILLS.slice(0, HALF);
const ROW_B = ALL_SKILLS.slice(HALF);

function Chip({ label }: { label: string }) {
  return (
    <span className="mono mx-1 rounded-md border border-border-subtle bg-surface px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent">
      {label}
    </span>
  );
}

export function Skills() {
  const groups = Object.entries(profile.skills);

  return (
    <div className="space-y-8">
      {/* infinite tech marquee */}
      <Reveal>
        <div className="relative overflow-hidden rounded-xl border border-border-subtle bg-surface py-3">
          <Marquee pauseOnHover className="[--duration:42s] py-0">
            {ROW_A.map((s) => (
              <Chip key={s} label={s} />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="mt-2 [--duration:48s] py-0">
            {ROW_B.map((s) => (
              <Chip key={s} label={s} />
            ))}
          </Marquee>
          {/* edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-bg-main to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-bg-main to-transparent" />
        </div>
      </Reveal>

      {/* capability matrix */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map(([category, items], i) => (
          <Reveal key={category} delay={(i % 3) * 70}>
            <div className="panel glow-border lift ticks h-full p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base">{category}</h3>
                <span className="num text-xs text-text-faint">
                  {String(items.length).padStart(2, "0")}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <span
                    key={item.name}
                    className="mono rounded-md border border-border-subtle bg-surface px-2 py-1 text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent"
                  >
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
