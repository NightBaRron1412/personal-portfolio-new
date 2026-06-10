import { profile } from "@/data/profile";

/**
 * schema.org structured data (JSON-LD) as a @graph: Person + WebSite +
 * ProfilePage. This builds a strong "entity" for Google so a search for
 * "Amir Shetaia" resolves to this site (rich result / knowledge panel). The
 * sameAs links tie the entity to authoritative profiles, which is the main
 * on-page signal for name-search ranking.
 *
 * Payload is fully static (from `profile`, no user input) with no HTML-special
 * characters, so rendering as script children is safe (no dangerous innerHTML).
 */
export function StructuredData() {
  const siteUrl = process.env.SITE_URL || "https://amirshetaia.com";
  const email = profile.social.email.replace(/^mailto:/, "");
  const personId = `${siteUrl}/#person`;
  const siteId = `${siteUrl}/#website`;

  const person = {
    "@type": "Person",
    "@id": personId,
    name: profile.name,
    url: siteUrl,
    image: `${siteUrl}/og-image.png`,
    jobTitle: "Senior Software Engineer",
    description: profile.summary,
    email: `mailto:${email}`,
    worksFor: { "@type": "Organization", name: "AMD", url: "https://www.amd.com" },
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "Queen's University", url: "https://www.queensu.ca" },
      { "@type": "CollegeOrUniversity", name: "Mansoura University", url: "https://www.mans.edu.eg/en" },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Toronto",
      addressRegion: "Ontario",
      addressCountry: "CA",
    },
    knowsAbout: [
      "GPU Drivers",
      "ROCm",
      "Linux Kernel",
      "High-Performance Computing",
      "C++",
      "OpenMP",
      "Machine Learning Systems",
      "Formal Methods",
      "Verification and Validation",
      "Embedded Systems",
    ],
    sameAs: [
      profile.social.github,
      "https://github.com/ashetaia-amd",
      profile.social.linkedin,
      "https://www.researchgate.net/profile/Amir-Shetaia",
    ],
  };

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      person,
      {
        "@type": "WebSite",
        "@id": siteId,
        url: siteUrl,
        name: profile.name,
        inLanguage: "en",
        publisher: { "@id": personId },
      },
      {
        "@type": "ProfilePage",
        "@id": `${siteUrl}/#profile`,
        url: siteUrl,
        name: "Amir Shetaia — Senior Software Engineer @ AMD",
        isPartOf: { "@id": siteId },
        about: { "@id": personId },
        mainEntity: { "@id": personId },
      },
    ],
  };

  return <script type="application/ld+json">{JSON.stringify(data)}</script>;
}
