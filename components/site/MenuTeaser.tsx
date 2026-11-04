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
    <div className="grain relative overflow-hidden bg-cream-deep py-16 sm:py-20">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
        <p className="eyebrow text-brass">La carte</p>
        <h2 className="mt-4 font-display text-[clamp(2rem,8vw,2.6rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink">
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
              className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-walnut"
            >
              {category.name}
            </motion.li>
          ))}
        </ul>

        {/* Quelques plats, pour donner le ton */}
        <ul className="mt-9 divide-y divide-line-soft border-y border-line-soft">
          {shown.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08, ease }}
              className="flex items-baseline gap-3 py-3"
            >
              <span className="font-display text-lg font-semibold text-ink">
                {item.name}
              </span>
              <span
                aria-hidden
                className="h-px flex-1 border-b border-dotted border-line"
              />
              <span className="shrink-0 font-display font-semibold tabular-nums text-aqua">
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
          className="group mt-8 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-walnut px-7 py-4 font-semibold text-cream transition-colors duration-300 hover:bg-walnut-deep"
        >
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
