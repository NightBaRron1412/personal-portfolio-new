import "./globals.css";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import type { Metadata, Viewport } from "next/types";
import { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { isAnalyticsEnabled, isSpeedInsightsEnabled } from "@/lib/analytics";
import { getSiteUrl } from "@/lib/site";
import { Providers } from "./providers";
import { StructuredData } from "./components/structured-data";
import { ArcadeMode } from "./components/arcade-mode";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0e14" },
    { media: "(prefers-color-scheme: light)", color: "#f4f6f8" },
  ],
};

const siteUrl = getSiteUrl();
const pageTitle = "Amir Shetaia | Senior Software Engineer at AMD";
const pageDescription =
  "Official portfolio of Amir Shetaia, Senior Software Engineer at AMD, featuring GPU driver and ROCm work, HPC systems, formal verification, and ML.";
const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();
const bingVerification = process.env.BING_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(`${siteUrl}/`),
  title: pageTitle,
  description: pageDescription,
  applicationName: "Amir Shetaia",
  authors: [{ name: "Amir Shetaia", url: siteUrl }],
  creator: "Amir Shetaia",
  publisher: "Amir Shetaia",
  category: "technology",
  referrer: "origin-when-cross-origin",
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: siteUrl },
  verification: {
    ...(googleVerification ? { google: googleVerification } : {}),
    ...(bingVerification ? { other: { "msvalidate.01": bingVerification } } : {}),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Icons are provided by the app/ file conventions: icon.svg (modern),
  // favicon.ico (legacy), apple-icon.png (iOS). No manual overrides needed.
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Amir Shetaia",
    title: pageTitle,
    description: pageDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Amir Shetaia, Senior Software Engineer at AMD",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-darkreader-skip
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}
    >
      <body className="font-sans antialiased text-[15px] sm:text-base" suppressHydrationWarning data-darkreader-skip>
        <Providers>{children}</Providers>
        <div className="grain" aria-hidden />
        <div className="crt" aria-hidden />
        <ArcadeMode />
        <StructuredData />
        {isAnalyticsEnabled ? <Analytics /> : null}
        {isSpeedInsightsEnabled ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
