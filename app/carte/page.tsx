import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Phone } from "lucide-react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MenuSection } from "@/components/site/MenuSection";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { getSiteContent } from "@/lib/data";
import { getOpenState } from "@/lib/hours";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSiteContent();
  return {
    title: "La carte",
    description: `La carte de ${settings.restaurant_name} à ${
      settings.city ?? "Nabeul"
    } : sandwichs, pizzas, pâtes et plats. ${settings.price_range ?? ""}`.trim(),
    alternates: { canonical: "/carte" },
  };
}

export default async function CartePage() {
  const { settings, categories, products } = await getSiteContent();
  const { isOpen, label } = getOpenState(settings.hours);

  const telHref = settings.phone
    ? `tel:${settings.phone.replace(/\s+/g, "")}`
    : null;

  return (
    <>
      <ScrollProgress />

      <Header
        name={settings.restaurant_name}
        logoUrl={settings.logo_url}
        phone={settings.phone}
      />

      <main>
        {/* En-tête court : la page doit arriver vite sur les plats. */}
        <section className="wood-deep grain relative pb-10 pt-28 sm:pb-14 sm:pt-32">
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-9">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-cream-dim/60 underline-offset-4 transition-colors hover:text-gold-soft hover:underline"
            >
              <ArrowLeft size={15} />
              {settings.restaurant_name}
            </Link>

            <h1 className="display mt-6 text-[clamp(2.1rem,7vw,3.6rem)] font-light text-cream">
              La carte
            </h1>

            <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 text-[13px] text-cream-dim/70">
              <span className="inline-flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isOpen ? "bg-cheese" : "bg-muted"
                  }`}
                />
                {label}
              </span>
              {settings.price_range && (
                <span>
                  Budget{" "}
                  <span className="text-cream">
                    {settings.price_range}
                  </span>
                </span>
              )}
              {telHref && (
                <a
                  href={telHref}
                  className="inline-flex items-center gap-2 font-medium text-gold-soft underline-offset-4 hover:underline"
                >
                  <Phone size={14} />
                  {settings.phone}
                </a>
              )}
            </div>
          </div>
        </section>

        <MenuSection
          categories={categories}
          products={products}
          currency={settings.currency}
          showHeading={false}
        />
      </main>

      <Footer settings={settings} />
    </>
  );
}
