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
import { ShaderBackground } from "@/components/ui/shader-background";

export default function HomePage() {
  return (
    <>
      {/* animated shader (21st.dev): full-width top band, masked so it dissolves
          into the page (no hard edge), with a left scrim for hero legibility */}
      <div
        aria-hidden
        className="hero-shader absolute inset-x-0 top-0 z-0 h-[115vh] overflow-hidden"
        style={{
          WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 42%, transparent 88%)",
          maskImage: "linear-gradient(to bottom, #000 0%, #000 42%, transparent 88%)",
        }}
      >
        <ShaderBackground className="h-full w-full opacity-50" />
        {/* darken the left (text) side, keep the shader vivid on the right */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-bg-main via-bg-main/85 to-transparent" />
        {/* gentle overall floor for small/secondary text */}
        <div className="pointer-events-none absolute inset-0 bg-bg-main/25" />
      </div>
      <div className="aurora" aria-hidden />
      <CursorGlow />
      <ScrollProgress />
      <Nav />
      <main className="relative z-10">
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
            lead="Two projects that show how I think — turning messy logs and moving vehicles into systems that hold up."
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
