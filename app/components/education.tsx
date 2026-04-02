"use client";

import { useRef } from "react";
import { profile } from "@/data/profile";
import { Section } from "./section";
import { Card, CardHeader, CardTitle, CardDescription } from "./ui/card";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useMotionPreference } from "../motion-provider";

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" } }
};

const awardVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export function Education() {
  const { hydrated, motionEnabled } = useMotionPreference();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const enableMotion = hydrated && motionEnabled;

  return (
    <Section id="education" className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-text-secondary">Education & Awards</p>
        <h2>Foundations and recognition</h2>
      </div>
      <motion.div
        ref={ref}
        className="grid gap-4 md:grid-cols-2"
        key={`education-degrees-${enableMotion ? "m" : "s"}`}
        variants={enableMotion ? gridVariants : undefined}
        initial={enableMotion ? "hidden" : false}
        animate={enableMotion && inView ? "visible" : {}}
      >
        {profile.education.degrees.map((degree) => (
          <motion.div key={degree.school} variants={enableMotion ? cardVariants : undefined}>
            <Card className="hover:-translate-y-1 transition transform hover:shadow-glow h-full">
              <CardHeader>
                <CardTitle className="text-lg">
                  <span className="flex items-center gap-2">
                    {(degree as any).logo && (
                      <Image
                        src={(degree as any).logo}
                        alt={`${degree.school} logo`}
                        width={64}
                        height={64}
                        className="inline-block h-12 w-12 shrink-0 object-contain"
                      />
                    )}
                    {(degree as any).schoolUrl ? (
                    <Link 
                      href={(degree as any).schoolUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-accent-blue transition-colors"
                    >
                      {degree.school}
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  ) : (
                    degree.school
                  )}
                  </span>
                </CardTitle>
                <CardDescription className="text-text-secondary font-medium">{degree.degree}</CardDescription>
                <div className="flex justify-between items-center text-sm text-text-secondary mt-2">
                  <span>{degree.year}</span>
                  {degree.gpa && <span className="font-semibold">GPA: {degree.gpa}</span>}
                </div>
                {degree.details && (
                  <p className="text-sm text-text-secondary mt-2">{degree.details}</p>
                )}
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      
      {profile.education.awards && profile.education.awards.length > 0 && (
        <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-4 shadow-soft">
          <h3 className="text-lg font-semibold text-text-primary">Awards & Honors</h3>
          <motion.ul
            className="mt-3 space-y-3 text-sm text-text-secondary"
            key={`education-awards-${enableMotion ? "m" : "s"}`}
            variants={enableMotion ? gridVariants : undefined}
            initial={enableMotion ? "hidden" : false}
            animate={enableMotion && inView ? "visible" : {}}
          >
            {profile.education.awards.map((award) => (
              <motion.li
                key={award.title}
                variants={enableMotion ? awardVariants : undefined}
                className="flex flex-col gap-1 rounded-xl border border-border-subtle bg-bg-elevated px-3 py-3 leading-relaxed"
              >
                <div className="font-semibold text-text-primary">{award.title}</div>
                <div>{award.details}</div>
                <div className="text-xs text-text-secondary">
                  {(award as any).issuerUrl ? (
                    <Link 
                      href={(award as any).issuerUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-accent-blue transition-colors"
                    >
                      {award.issuer}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : (
                    award.issuer
                  )}
                  {' · '}{award.year}
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      )}

      {profile.education.certifications && profile.education.certifications.length > 0 && (
        <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-4 shadow-soft">
          <h3 className="text-lg font-semibold text-text-primary">Certifications</h3>
          <ul className="mt-3 space-y-3 text-sm text-text-secondary">
            {profile.education.certifications.map((cert: any) => (
              <li
                key={cert.name}
                className="flex flex-col gap-1 rounded-xl border border-border-subtle bg-bg-elevated px-3 py-3 leading-relaxed sm:flex-row sm:items-center sm:justify-between"
              >
                <span>{cert.name} · {cert.issuer}</span>
                <span className="text-text-secondary">{cert.year}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}
