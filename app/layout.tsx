import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { getSiteContent } from "@/lib/data";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#2e7d7b",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSiteContent();
  const name = settings.restaurant_name;
  const city = settings.city ?? "Nabeul";
  const title = `${name} — ${settings.tagline} à ${city}`;
  const description =
    settings.description ??
    `${name}, restaurant et fast food à ${city}. Carte généreuse, terrasse, service jusque tard le soir.`;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000");

  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s · ${name}` },
    description,
    applicationName: name,
    keywords: [
      name,
      "restaurant",
      "fast food",
      city,
      "Tunisie",
      "pizza",
      "burger",
      "tacos",
      "terrasse",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      locale: "fr_TN",
      siteName: name,
      images: [{ url: settings.hero_image_url ?? "/photos/salle-3.png" }],
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
