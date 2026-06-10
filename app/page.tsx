import { Nav } from "./components/nav";
import { ScrollProgress } from "./components/scroll-progress";
import { BackToTop } from "./components/back-to-top";
import { Hero } from "./components/hero";
import { WorkedAt } from "./components/worked-at";
import { Section } from "./components/section";
import { About } from "./components/about";
import { Skills } from "./components/skills";
import { Work } from "./components/work";
import { Experience } from "./components/experience";
import { Education } from "./components/education";
import { Signals } from "./components/signals";
import { Testimonials } from "./components/testimonials";
import { Contact } from "./components/contact";
import { Footer } from "./components/footer";
import { SpotifyWidget } from "./components/spotify-widget";
import { CursorGlow } from "./components/cursor-glow";
import { InstrumentField } from "./components/instrument-field";
import { HeroBackdrop } from "./components/hero-backdrop";

export default function HomePage() {
  return (
    <>
      {/* skip-to-content: first focusable element, visible only on keyboard focus */}
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:border focus:border-accent focus:bg-bg-main focus:px-4 focus:py-2 focus:text-sm focus:text-text-primary focus:shadow-glow"
      >
        Skip to content
      </a>
      {/* animated plasma shader band with scroll parallax */}
      <HeroBackdrop />
      <div className="aurora" aria-hidden />
      <InstrumentField />
      <CursorGlow />
      <ScrollProgress />
      <Nav />
      <main id="content" className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Hero />

          <WorkedAt />

          <Section
            id="about"
            index="01"
            title="About"
            meta="profile"
            lead="The short version of a longer story — from Mansoura to Toronto, always drawn to the layer just below the surface."
          >
            <About />
          </Section>

          <Section
            id="skills"
            index="02"
            title="Capabilities"
            meta="stack"
            lead="The tools I reach for, grouped by where they live in the stack — from silicon up to models."
          >
            <Skills />
          </Section>

          <Section
            id="work"
            index="03"
            title="Selected Work"
            meta="case studies"
            lead="A few projects that show how I think — making a parallel solver reproducible, taming messy logs, and putting a car's senses on the edge."
          >
            <Work />
          </Section>

          <Section
            id="experience"
            index="04"
            title="Experience"
            meta="timeline"
            lead="The path here: robotics clubs and embedded benches, then cloud, HPC, and research — and now GPU drivers at AMD."
          >
            <Experience />
          </Section>

          <Section
            id="education"
            index="05"
            title="Education & Awards"
            meta="credentials"
            lead="Where the foundations were poured — and a few moments that told me I was on the right track."
          >
            <Education />
          </Section>

          <Section
            id="signals"
            index="06"
            title="Live Signals"
            meta="realtime"
            lead="Not a static résumé — live proof that I'm still building, right now."
          >
            <Signals />
          </Section>

          <Section
            id="testimonials"
            index="07"
            title="References"
            meta="people"
            lead="What the people I've built and shipped with have to say."
          >
            <Testimonials />
          </Section>

          <Section
            id="contact"
            index="08"
            title="Contact"
            meta="say hi"
            lead="If any of this resonates — a hard problem, a role, or just comparing notes — let's talk."
          >
            <Contact />
          </Section>

          <Footer />
        </div>
      </main>
      <SpotifyWidget />
      <BackToTop />
    </>
  );
}
