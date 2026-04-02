import { DefaultSeoProps } from "next-seo";

const siteUrl = process.env.SITE_URL || "https://amirshetaia.com";

const config: DefaultSeoProps = {
  title: "Amir Shetaia | Senior Software Engineer @ AMD",
  description: "Senior Software Engineer at AMD developing GPU drivers for the ROCm platform. Specializing in HPC, ML systems, and formal verification.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Amir Shetaia",
    images: [
      {
        url: "/og/og-image.png",
        width: 1200,
        height: 630,
        alt: "Amir Shetaia - Senior Software Engineer at AMD"
      }
    ]
  },
  twitter: {
    handle: "@amirsh_dev",
    site: "@amirsh_dev",
    cardType: "summary_large_image"
  },
  additionalLinkTags: [
    {
      rel: "icon",
      href: "/favicon.ico"
    }
  ]
};

export default config;
