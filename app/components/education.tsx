import { Award, Users } from "lucide-react";
import { profile } from "@/data/profile";
import { Logo } from "./logo";
import { Reveal } from "./reveal";
import { GpaRing } from "./gpa-ring";

/** Parse a "value/max" GPA string (e.g. "3.80/4.0") into numbers. */
function parseGpa(gpa: string): { value: number; max: number } | null {
  const [v, m] = gpa.split("/").map((s) => Number.parseFloat(s.trim()));
  if (Number.isFinite(v) && Number.isFinite(m) && m > 0) return { value: v, max: m };
  return null;
}

export function Education() {
  const { degrees, awards } = profile.education;
  const community = profile.community;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Degrees */}
      <div className="space-y-4">
        {degrees.map((d, i) => {
          const gpa = parseGpa(d.gpa);
          return (
            <Reveal key={d.school} delay={i * 70}>
              <div className="panel glow-border lift ticks p-5">
                <div className="flex items-start gap-4">
                  <Logo src={d.logo} name={d.school} className="h-11 w-11 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base leading-snug">{d.degree}</h3>
                    {/* School + year on their own line — never crowded by the GPA */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <a
                        href={d.schoolUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mono text-xs text-text-secondary transition-colors hover:text-accent"
                      >
                        {d.school}
                      </a>
                      <span aria-hidden className="text-text-faint">·</span>
                      <span className="num text-xs text-text-faint">{d.year}</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-text-secondary">{d.details}</p>
                  </div>
                  {gpa ? <GpaRing value={gpa.value} max={gpa.max} /> : null}
                </div>
              </div>
            </Reveal>
          );
        })}
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
