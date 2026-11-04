import { About } from "@/components/site/About";
import { CheeseBand } from "@/components/site/CheeseBand";
import { CheeseDrip } from "@/components/site/Cheese";
import { Footer } from "@/components/site/Footer";
import { Gallery } from "@/components/site/Gallery";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { MenuSection } from "@/components/site/MenuSection";
import { MenuTeaser } from "@/components/site/MenuTeaser";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { Visit } from "@/components/site/Visit";
import { getSiteContent } from "@/lib/data";
import { getOpenState } from "@/lib/hours";

/** Les modifications faites depuis /admin apparaissent en moins d'une minute. */
export const revalidate = 60;

export default async function HomePage() {
  const { settings, categories, products, gallery } = await getSiteContent();
  const { isOpen, label, todayIndex } = getOpenState(settings.hours);

  // Bandeau défilant : les plats mis en avant, sinon les catégories.
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
    hasMenu: "/carte",
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

        <CheeseDrip
          from="var(--color-cream)"
          background="var(--color-night)"
        />
        <CheeseBand />

        {/*
          Sur mobile la carte complète rendrait la page interminable :
          on n'affiche qu'un aperçu, renvoyant vers /carte. Sur grand
          écran, la carte reste lisible d'une traite et reste en place.
        */}
        <section id="carte">
          <div className="lg:hidden">
            <MenuTeaser
              categories={categories}
              products={products}
              currency={settings.currency}
            />
          </div>
          <div className="hidden lg:block">
            <MenuSection
              categories={categories}
              products={products}
              currency={settings.currency}
            />
          </div>
        </section>

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
