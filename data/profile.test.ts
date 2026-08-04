import { describe, it, expect } from "vitest";
import { profile } from "./profile";

describe("profile data integrity", () => {
  it("has core identity fields", () => {
    expect(profile.name).toBe("Amir Shetaia");
    expect(profile.title).toMatch(/Senior Software Engineer/);
    expect(profile.social.github).toMatch(/^https:\/\/github\.com\//);
    expect(profile.social.linkedin).toMatch(/^https:\/\/(www\.)?linkedin\.com\//);
    expect(profile.social.email).toMatch(/^mailto:.+@.+/);
  });

  it("every experience entry is complete", () => {
    expect(profile.experience.length).toBeGreaterThan(0);
    for (const e of profile.experience) {
      expect(e.company, `company missing`).toBeTruthy();
      expect(e.role, `${e.company}: role`).toBeTruthy();
      expect(e.dates, `${e.company}: dates`).toBeTruthy();
      expect(e.summary, `${e.company}: summary`).toBeTruthy();
      expect(e.bullets.length, `${e.company}: bullets`).toBeGreaterThan(0);
      expect(e.tech.length, `${e.company}: tech`).toBeGreaterThan(0);
    }
  });

  it("every project has title/description/tech and valid links", () => {
    const allProjects = [...profile.projects, ...profile.otherProjects];
    expect(profile.projects.length).toBeGreaterThan(0);
    expect(profile.otherProjects.length).toBeGreaterThanOrEqual(8);
    for (const p of allProjects) {
      expect(p.title).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.tech.length).toBeGreaterThan(0);
      if (p.repo) expect(p.repo, `${p.title}: repo`).toMatch(/^https?:\/\//);
      if (p.demo) expect(p.demo, `${p.title}: demo`).toMatch(/^https?:\/\//);
    }
  });

  it("testimonials have a substantive quote, name, and avatar path", () => {
    for (const t of profile.testimonials) {
      expect(t.quote.length).toBeGreaterThan(20);
      expect(t.name).toBeTruthy();
      expect(t.avatar).toMatch(/^\/images\//);
    }
  });

  it("education degrees are complete", () => {
    for (const d of profile.education.degrees) {
      expect(d.school).toBeTruthy();
      expect(d.degree).toBeTruthy();
      expect(d.gpa).toBeTruthy();
    }
  });
});
