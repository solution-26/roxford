"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { SplitText } from "./SplitText";
import { formatAmount, formatPrice } from "@/lib/hours";
import type { Category, Product } from "@/lib/types";

const ease = [0.2, 0, 0, 1] as const;

/** Largeur d'une colonne de prix, partagée par l'en-tête et les lignes. */
const COL = "w-[4.75rem]";

/**
 * Renvoie les tailles d'une catégorie si — et seulement si — tous ses plats
 * portent exactement les mêmes étiquettes (ex. S / L / XL pour les pizzas).
 * Dans ce cas la catégorie s'affiche en colonnes, comme le panneau du
 * restaurant. Sinon, chaque plat garde son prix unique.
 */
function sharedVariantLabels(items: Product[]): string[] | null {
  if (items.length === 0) return null;
  const first = items[0].price_variants;
  if (!first || first.length === 0) return null;

  const labels = first.map((v) => v.label);
  const same = items.every(
    (item) =>
      item.price_variants.length === labels.length &&
      item.price_variants.every((v, i) => v.label === labels[i]),
  );

  return same ? labels : null;
}

export function MenuSection({
  categories,
  products,
  currency,
  showHeading = true,
}: {
  categories: Category[];
  products: Product[];
  currency: string;
  /** false sur /carte, où la page porte déjà son titre. */
  showHeading?: boolean;
}) {
  const [active, setActive] = useState<string>("all");
  const reduced = useReducedMotion();

  // On n'affiche que les catégories qui contiennent réellement un plat.
  const filled = useMemo(
    () =>
      categories.filter((c) =>
        products.some((p) => p.category_id === c.id && p.is_available),
      ),
    [categories, products],
  );

  const visible = useMemo(() => {
    const available = products.filter((p) => p.is_available);
    return active === "all"
      ? available
      : available.filter((p) => p.category_id === active);
  }, [products, active]);

  const grouped = useMemo(() => {
    const source = active === "all" ? filled : filled.filter((c) => c.id === active);
    return source
      .map((category) => {
        const items = visible.filter((p) => p.category_id === category.id);
        return { category, items, variantLabels: sharedVariantLabels(items) };
      })
      .filter((g) => g.items.length > 0);
  }, [filled, visible, active]);

  if (filled.length === 0) {
    return (
      <section className="bg-cream-deep py-24">
        <div className="mx-auto max-w-[1180px] px-4 text-center sm:px-6 lg:px-9">
          <p className="eyebrow text-brass">La carte</p>
          <h2 className="mt-5 font-display text-4xl font-semibold text-ink">
            La carte arrive bientôt
          </h2>
          <p className="mx-auto mt-4 max-w-md text-ink-2">
            Les plats seront publiés très prochainement. En attendant,
            appelez-nous : on vous dit tout.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`grain relative overflow-hidden bg-cream-deep pb-20 sm:pb-28 lg:pb-32 ${
        showHeading ? "pt-20 sm:pt-28 lg:pt-32" : "pt-6"
      }`}
    >
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-9">
        {/* — Titre. Masqué sur /carte, où la page a déjà le sien. — */}
        {showHeading && (
          <div className="text-center">
            <motion.p
              className="eyebrow text-brass"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              La carte
            </motion.p>
            <h2 className="mx-auto mt-5 max-w-2xl font-display text-[clamp(2.2rem,5.5vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink">
              <SplitText
                text="Tout est préparé minute"
                highlight={["minute"]}
                delay={0.08}
              />
            </h2>
            <motion.div
              className="rule-brass mx-auto mt-8 h-px w-40"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease }}
            />
          </div>
        )}

        {/* — Filtres de catégories — */}
        <div
          className={`no-print sticky top-[4.5rem] z-30 -mx-4 px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-9 lg:px-9 ${
            showHeading ? "mt-12" : ""
          }`}
        >
          <div className="fade-edges overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="mx-auto flex w-max gap-1.5 rounded-full border border-line bg-cream/85 p-1.5 shadow-[0_10px_34px_-24px_rgba(32,25,20,0.7)] backdrop-blur-xl">
              <Tab
                label="Tout"
                isActive={active === "all"}
                onClick={() => setActive("all")}
              />
              {filled.map((c) => (
                <Tab
                  key={c.id}
                  label={c.name}
                  isActive={active === c.id}
                  onClick={() => setActive(c.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* — Plats, groupés par catégorie — */}
        <div className="mt-14 space-y-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className="space-y-20"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease }}
            >
              {grouped.map(({ category, items, variantLabels }) => (
                <div key={category.id}>
                  <div className="mb-8 flex items-baseline gap-5">
                    <h3 className="font-display text-2xl font-semibold tracking-tight text-walnut sm:text-3xl">
                      {category.name}
                    </h3>
                    <span className="h-px flex-1 bg-line" />
                    {category.description && (
                      <span className="hidden text-sm italic text-muted sm:block">
                        {category.description}
                      </span>
                    )}
                  </div>

                  {/* En-tête des tailles : une seule fois pour la catégorie */}
                  {variantLabels && (
                    <div className="mb-1 flex justify-end gap-2 pr-4">
                      {variantLabels.map((label) => (
                        <span
                          key={label}
                          className={`${COL} text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-brass`}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}

                  <div
                    className={
                      variantLabels
                        ? "grid gap-y-1"
                        : "grid gap-x-12 gap-y-2 lg:grid-cols-2"
                    }
                  >
                    {items.map((item, i) => (
                      <Dish
                        key={item.id}
                        item={item}
                        currency={currency}
                        index={i}
                        reduced={!!reduced}
                        columns={!!variantLabels}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="mt-16 text-center text-sm text-muted">
          Prix en dinars tunisiens, taxes comprises. Une allergie, une
          intolérance&nbsp;? Signalez-le à votre serveur.
        </p>
      </div>
    </section>
  );
}

function Tab({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
        isActive ? "text-cream" : "text-ink-2 hover:text-walnut"
      }`}
    >
      {isActive && (
        <motion.span
          layoutId="menu-tab"
          className="absolute inset-0 rounded-full bg-walnut"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      <span className="relative z-10 whitespace-nowrap">{label}</span>
    </button>
  );
}

function Dish({
  item,
  currency,
  index,
  reduced,
  columns,
}: {
  item: Product;
  currency: string;
  index: number;
  reduced: boolean;
  /** true quand toute la catégorie partage les mêmes tailles. */
  columns: boolean;
}) {
  return (
    <motion.article
      // Sans description, la ligne se resserre : on reste proche de la
      // densité d'une carte imprimée.
      className={`group relative flex items-start gap-4 rounded-2xl px-4 transition-colors duration-300 hover:bg-cream ${
        item.description || item.image_url ? "py-3.5" : "py-2"
      }`}
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.045, 0.3), ease }}
    >
      {/* Vignette ronde — un hublot — quand une photo existe */}
      {item.image_url && (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-brass/55 ring-offset-2 ring-offset-cream-deep transition-transform duration-500 group-hover:scale-105">
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            sizes="64px"
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h4 className="font-display text-lg font-semibold text-ink">
            {item.name}
          </h4>

          {item.is_featured && (
            <span className="inline-flex shrink-0 items-center rounded-full border border-brass/45 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brass">
              Signature
            </span>
          )}

          {/* Ligne de pointillés, comme sur une carte imprimée */}
          <span
            aria-hidden
            className="mx-1 hidden h-px min-w-6 flex-1 self-center border-b border-dotted border-line sm:block"
          />

          {columns ? (
            // Une colonne par taille, alignée sur l'en-tête de la catégorie.
            <span className="ml-auto flex shrink-0 gap-2 sm:ml-0">
              {item.price_variants.map((variant) => (
                <span
                  key={variant.label}
                  className={`${COL} text-right font-display text-lg font-semibold tabular-nums text-aqua`}
                >
                  <span className="sr-only">{variant.label} : </span>
                  {formatAmount(variant.price)}
                </span>
              ))}
            </span>
          ) : item.price_variants.length > 0 ? (
            // Tailles non uniformes dans la catégorie : on les met en ligne.
            <span className="ml-auto flex shrink-0 flex-wrap justify-end gap-x-3 sm:ml-0">
              {item.price_variants.map((variant) => (
                <span
                  key={variant.label}
                  className="font-display text-lg font-semibold tabular-nums text-aqua"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {variant.label}{" "}
                  </span>
                  {formatAmount(variant.price)}
                </span>
              ))}
            </span>
          ) : (
            <span className="ml-auto shrink-0 font-display text-lg font-semibold tabular-nums text-aqua sm:ml-0">
              {formatPrice(item.price, currency)}
            </span>
          )}
        </div>

        {item.description && (
          <p className="mt-1 text-[15px] leading-relaxed text-muted">
            {item.description}
          </p>
        )}

        {item.tags.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-sand px-2 py-0.5 text-[11px] font-medium text-walnut"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.article>
  );
}
