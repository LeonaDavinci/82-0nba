import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-inter",
});

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://82-0nba.com").replace(/\/$/, "");
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-JP6Y587W7M";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "82-0 — NBA Team Builder Game | Draft Legends",
    template: "%s | 82-0",
  },
  description:
    "82-0 is the NBA team builder game where you draft all-time legends under random constraints and chase a flawless 82-0 season. Play the free 82-0 NBA game now.",
  keywords: [
    "82-0",
    "82-0 nba",
    "82-0 game",
    "82-0game",
    "nba team builder",
    "nba draft game",
    "basketball roster builder",
    "undefeated nba season",
    "nba legends draft",
  ],
  applicationName: "82-0",
  authors: [{ name: "82-0" }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "82-0",
    url: "/",
    title: "82-0 — NBA Team Builder Game",
    description:
      "Draft NBA legends and chase a perfect 82-0 season in the 82-0 NBA team builder game.",
    images: [{ url: "/opengraph.jpg", width: 1200, height: 630, alt: "82-0 NBA Team Builder Game" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "82-0 — NBA Team Builder Game",
    description:
      "Draft NBA legends and chase a perfect 82-0 season in the 82-0 NBA team builder game.",
    images: ["/opengraph.jpg"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#1D428A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "82-0",
    alternateName: "82-0 NBA Team Builder",
    url: `${SITE_URL}/`,
    description:
      "82-0 is the NBA team builder game where you draft all-time legends under random constraints and chase a flawless 82-0 season.",
    applicationCategory: "GameApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "82-0",
    url: `${SITE_URL}/`,
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <div className="min-h-screen bg-background">{children}</div>

        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
