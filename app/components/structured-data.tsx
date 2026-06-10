import { profile } from "@/data/profile";

/**
 * schema.org Person structured data (JSON-LD).
 * Powers Google rich results / knowledge panel for the portfolio.
 * Server component — emitted once in the layout.
 *
 * The payload is fully static (built from `profile`, no user input) and
 * contains no HTML-special characters, so rendering it as script children
 * is safe and parseable — no dangerouslySetInnerHTML needed.
 */
export function StructuredData() {
  const siteUrl = process.env.SITE_URL || "https://amirshetaia.com";
  const email = profile.social.email.replace(/^mailto:/, "");

  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: siteUrl,
    image: `${siteUrl}/og-image.png`,
    jobTitle: "Senior Software Engineer",
    description: profile.summary,
    email: `mailto:${email}`,
    worksFor: {
      "@type": "Organization",
      name: "AMD",
      url: "https://www.amd.com",
    },
    alumniOf: [
      {
        "@type": "CollegeOrUniversity",
        name: "Queen's University",
        url: "https://www.queensu.ca",
      },
      {
        "@type": "CollegeOrUniversity",
        name: "Mansoura University",
        url: "https://www.mans.edu.eg/en",
      },
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
    sameAs: [profile.social.github, profile.social.linkedin],
  };

  return (
    <script type="application/ld+json">{JSON.stringify(data)}</script>
  );
}
