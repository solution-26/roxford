import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { getSiteContent } from "@/lib/data";

/**
 * Serif claire, à l'aise en capitales très espacées : le titrage du lieu.
 * Trois graisses seulement, les seules employées — chaque graisse en plus
 * est un fichier de plus à télécharger.
 */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["300", "400", "500"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#241810",
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
      images: [{ url: settings.hero_image_url ?? "/photos/salle-3.webp" }],
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
