import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BuildStack – Discover Any Website's Tech Stack",
  description:
    "Paste any URL and instantly discover the frameworks, infrastructure, and tools powering it. Free tech stack analyzer.",
  keywords: ["tech stack", "website analyzer", "technology detection", "framework detector"],
  openGraph: {
    title: "BuildStack – Discover Any Website's Tech Stack",
    description:
      "Instantly detect frameworks, CDN, analytics, and more for any website.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" />
      </head>
      <body className="min-h-screen bg-bg-base antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
