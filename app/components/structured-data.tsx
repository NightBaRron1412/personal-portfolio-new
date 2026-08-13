import { profile } from "@/data/profile";
import { getSiteUrl } from "@/lib/site";

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
  const siteUrl = getSiteUrl();
  const email = profile.social.email.replace(/^mailto:/, "");
  const personId = `${siteUrl}/#person`;
  const siteId = `${siteUrl}/#website`;
  const profilePageId = `${siteUrl}/#profile-page`;
  const portraitId = `${siteUrl}/#portrait`;

  const portrait = {
    "@type": "ImageObject",
    "@id": portraitId,
    url: `${siteUrl}${profile.portrait}`,
    contentUrl: `${siteUrl}${profile.portrait}`,
    name: "Amir Shetaia portrait",
    caption: "Amir Shetaia, Senior Software Engineer at AMD in Toronto, Ontario",
    representativeOfPage: true,
    creditText: "Amir Shetaia",
  };

  const person = {
    "@type": "Person",
    "@id": personId,
    name: profile.name,
    givenName: "Amir",
    familyName: "Shetaia",
    alternateName: ["ashetaia", "NightBaRron1412"],
    url: siteUrl,
    mainEntityOfPage: { "@id": profilePageId },
    image: { "@id": portraitId },
    jobTitle: "Senior Software Engineer",
    description: profile.summary,
    email: `mailto:${email}`,
    worksFor: {
      "@type": "Organization",
      "@id": "https://www.amd.com/#organization",
      name: "AMD",
      legalName: "Advanced Micro Devices, Inc.",
      url: "https://www.amd.com",
    },
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
      profile.social.githubAmd,
      profile.social.linkedin,
      "https://www.researchgate.net/profile/Amir-Shetaia",
    ],
    subjectOf: [
      {
        "@type": "WebPage",
        name: "Amir Shetaia at CritLab, Queen's University",
        url: "https://critlab.smithengineering.queensu.ca/people/",
      },
      {
        "@type": "ScholarlyArticle",
        name: "DeepParse: Hybrid Log Parsing with LLM-Synthesized Regex Masks",
        url: "https://www.researchgate.net/publication/404103013_DeepParse_Hybrid_Log_Parsing_with_LLM-Synthesized_Regex_Masks",
      },
    ],
  };

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      person,
      portrait,
      {
        "@type": "WebSite",
        "@id": siteId,
        url: siteUrl,
        name: profile.name,
        alternateName: "Amir Shetaia Portfolio",
        description: profile.summary,
        inLanguage: "en",
        publisher: { "@id": personId },
      },
      {
        "@type": "ProfilePage",
        "@id": profilePageId,
        url: siteUrl,
        name: "Amir Shetaia — Senior Software Engineer at AMD",
        headline: "Amir Shetaia — Senior Software Engineer at AMD",
        description: profile.summary,
        dateCreated: "2026-04-02",
        dateModified: "2026-08-04",
        inLanguage: "en",
        isPartOf: { "@id": siteId },
        about: { "@id": personId },
        mainEntity: { "@id": personId },
        primaryImageOfPage: { "@id": portraitId },
      },
    ],
  };

  return <script type="application/ld+json">{JSON.stringify(data)}</script>;
}
