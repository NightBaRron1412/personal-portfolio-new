import { DefaultSeoProps } from "next-seo";
import { getSiteUrl } from "./lib/site";

const siteUrl = getSiteUrl();

const config: DefaultSeoProps = {
  title: "Amir Shetaia | Senior Software Engineer at AMD",
  description: "Official portfolio of Amir Shetaia, Senior Software Engineer at AMD, featuring GPU driver and ROCm work, HPC systems, formal verification, and ML.",
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
        alt: "Amir Shetaia, Senior Software Engineer at AMD"
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
