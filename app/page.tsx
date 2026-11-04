import { About } from "@/components/site/About";
import { CheeseDrip } from "@/components/site/Cheese";
import { CheeseSection } from "@/components/site/CheeseSection";
import { Footer } from "@/components/site/Footer";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { Gallery } from "@/components/site/Gallery";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { MenuSection } from "@/components/site/MenuSection";
import { Visit } from "@/components/site/Visit";
import { getSiteContent } from "@/lib/data";
import { getOpenState } from "@/lib/hours";

/** Les modifications faites depuis /admin apparaissent en moins d'une minute. */
export const revalidate = 60;

export default async function HomePage() {
  const { settings, categories, products, gallery } = await getSiteContent();
  const { isOpen, label, todayIndex } = getOpenState(settings.hours);

  // Bandeau défilant : les spécialités de la maison, sinon les catégories.
  const highlights = products
    .filter((p) => p.is_featured && p.is_available)
    .map((p) => p.name);
  const marqueeItems = (
    highlights.length >= 4 ? highlights : categories.map((c) => c.name)
  ).slice(0, 10);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: settings.restaurant_name,
    description: settings.description ?? undefined,
    telephone: settings.phone ?? undefined,
    priceRange: settings.price_range ?? undefined,
    servesCuisine: ["Fast food", "Tunisienne", "Italienne"],
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address ?? undefined,
      addressLocality: settings.city ?? undefined,
      addressCountry: "TN",
    },
    sameAs: [settings.facebook_url, settings.instagram_url].filter(Boolean),
    openingHoursSpecification: settings.hours
      .filter((h) => !h.closed)
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.day,
        opens: h.open,
        closes: h.close,
      })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Données structurées : aide Google à afficher horaires et téléphone.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <ScrollProgress />

      <Header
        name={settings.restaurant_name}
        logoUrl={settings.logo_url}
        phone={settings.phone}
      />

      <main>
        <Hero settings={settings} openLabel={label} isOpen={isOpen} />
        <Marquee items={marqueeItems} />
        <About settings={settings} />

        {/* Coulée de fromage : la salle s'ouvre sur la spécialité */}
        <CheeseDrip
          from="var(--color-cheese)"
          background="var(--color-walnut-deep)"
        />
        <CheeseSection />
        <CheeseDrip
          from="var(--color-walnut-deep)"
          background="var(--color-cream-deep)"
        />

        <MenuSection
          categories={categories}
          products={products}
          currency={settings.currency}
        />
        <Gallery images={gallery} />
        <Visit
          settings={settings}
          todayIndex={todayIndex}
          isOpen={isOpen}
          openLabel={label}
        />
      </main>

      <Footer settings={settings} />
    </>
  );
}
