"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatAmount, formatPrice } from "@/lib/hours";
import type { Category, Product } from "@/lib/types";

const ease = [0.2, 0, 0, 1] as const;

/**
 * Aperçu de la carte, affiché à la place du menu complet sur mobile.
 *
 * La carte entière rendrait la page d'accueil interminable au doigt :
 * on montre les catégories et quelques plats, et on renvoie vers
 * /carte pour le reste.
 */
export function MenuTeaser({
  categories,
  products,
  currency,
}: {
  categories: Category[];
  products: Product[];
  currency: string;
}) {
  const highlights = products
    .filter((p) => p.is_available && p.is_featured)
    .slice(0, 4);

  // Si rien n'est marqué « signature », on prend les premiers plats.
  const shown = highlights.length
    ? highlights
    : products.filter((p) => p.is_available).slice(0, 4);

  const count = products.filter((p) => p.is_available).length;

  return (
    <div className="wood grain relative overflow-hidden py-16 sm:py-20">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
        <p className="eyebrow text-gold">La carte</p>
        <h2 className="display mt-5 text-[clamp(1.7rem,7vw,2.3rem)] font-light text-cream">
          {count} plats, préparés minute
        </h2>

        {/* Les catégories, en un coup d'œil */}
        <ul className="mt-7 flex flex-wrap gap-2">
          {categories.map((category, i) => (
            <motion.li
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05, ease }}
              className="border border-gold/25 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-cream-dim/75"
            >
              {category.name}
            </motion.li>
          ))}
        </ul>

        {/* Quelques plats, pour donner le ton */}
        <ul className="mt-9 divide-y divide-gold/12 border-y border-gold/20">
          {shown.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08, ease }}
              className="flex items-baseline gap-3 py-3"
            >
              <span className="font-display text-[17px] font-medium tracking-wide text-cream">
                {item.name}
              </span>
              <span
                aria-hidden
                className="h-px flex-1 border-b border-dotted border-gold/25"
              />
              <span className="shrink-0 font-display text-[16px] font-medium tabular-nums text-cheese">
                {item.price_variants.length > 0
                  ? item.price_variants
                      .map((v) => `${v.label} ${formatAmount(v.price)}`)
                      .join("  ")
                  : formatPrice(item.price, currency)}
              </span>
            </motion.li>
          ))}
        </ul>

        <Link
          href="/carte"
          className="group relative mt-9 inline-flex w-full items-center justify-center gap-2.5 overflow-hidden border border-gold/55 px-7 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-gold-pale transition-colors duration-500 hover:text-wood-deep"
        >
          <span className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-gold transition-transform duration-500 ease-[cubic-bezier(.2,0,0,1)] group-hover:scale-y-100" />
          Voir toute la carte
          <ArrowRight
            size={18}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </div>
  );
}
