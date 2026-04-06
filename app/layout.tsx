import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata, Viewport } from "next/types";
import { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { isAnalyticsEnabled, isSpeedInsightsEnabled } from "@/lib/analytics";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  viewportFit: "cover",
};

const siteUrl = process.env.SITE_URL || "https://amirshetaia.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Amir Shetaia | Senior Software Engineer @ AMD",
  description:
    "Senior Software Engineer at AMD developing GPU drivers for the ROCm platform. Specializing in HPC, ML systems, and formal verification.",
  icons: [
    { rel: "icon", url: "/favicon.png", type: "image/png" },
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Amir Shetaia",
    title: "Amir Shetaia | Senior Software Engineer @ AMD",
    description: "GPU drivers for ML & data center workloads on ROCm. HPC optimization, formal methods, and verification systems.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Amir Shetaia - Senior Software Engineer at AMD",
        type: "image/png"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Amir Shetaia | Senior Software Engineer @ AMD",
    description: "GPU drivers for ML & data center workloads on ROCm. HPC, formal methods, verification.",
    images: ["/og-image.png"],
    creator: "@amirsh_dev"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-darkreader-skip data-scroll-behavior="smooth">
      <body className={`${inter.className} antialiased text-sm sm:text-base`} suppressHydrationWarning data-darkreader-skip>
        <Providers>{children}</Providers>
        {isAnalyticsEnabled ? <Analytics /> : null}
        {isSpeedInsightsEnabled ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
