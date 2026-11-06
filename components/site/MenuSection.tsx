"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatAmount, formatPrice } from "@/lib/hours";
import type { Category, Product } from "@/lib/types";
import { SplitText } from "./SplitText";

const ease = [0.2, 0, 0, 1] as const;

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
  // Vide au départ : la catégorie est choisie une fois `filled` connu.
  const [active, setActive] = useState<string>("");
  const reduced = useReducedMotion();
  const tabsRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  // On n'affiche que les catégories qui contiennent réellement un plat.
  const filled = useMemo(
    () =>
      categories.filter((c) =>
        products.some((p) => p.category_id === c.id && p.is_available),
      ),
    [categories, products],
  );

  /**
   * Choix de la catégorie de départ.
   *
   * Il n'y a volontairement pas d'onglet « Tout » : 45 plats d'un seul
   * tenant, personne ne les lit. On ouvre donc sur une catégorie —
   * celle du fragment si l'on arrive par « /carte#pizzas », la première
   * sinon.
   */
  useEffect(() => {
    if (active || filled.length === 0) return;

    const slug = decodeURIComponent(
      window.location.hash.replace(/^#/, ""),
    ).trim();
    const match = slug ? filled.find((c) => c.slug === slug) : undefined;

    setActive(match ? match.id : filled[0].id);

    if (match) {
      // Après le rendu, on amène les filtres juste sous l'en-tête.
      requestAnimationFrame(() => {
        tabsRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
      });
    }
  }, [filled, active]);

  /**
   * Le rail des filtres déborde horizontalement : sans cela, l'onglet
   * actif peut rester hors champ et l'on croit que rien n'a changé.
   */
  useEffect(() => {
    const current = railRef.current?.querySelector<HTMLElement>(
      '[data-active="true"]',
    );
    current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [active]);

  const current = filled.find((c) => c.id === active) ?? null;
  const items = useMemo(
    () =>
      products
        .filter((p) => p.is_available && p.category_id === active)
        .sort((a, b) => a.sort_order - b.sort_order),
    [products, active],
  );

  if (filled.length === 0) {
    return (
      <section className="wood grain relative py-24">
        <div className="mx-auto max-w-[1180px] px-4 text-center sm:px-6">
          <p className="eyebrow text-gold">La carte</p>
          <h2 className="display mt-6 text-3xl font-light text-cream">
            La carte arrive bientôt
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-cream-dim/70">
            Les plats seront publiés très prochainement. En attendant,
            appelez-nous : on vous dit tout.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`wood grain relative overflow-hidden pb-20 sm:pb-28 ${
        showHeading ? "pt-20 sm:pt-28" : "pt-8"
      }`}
    >
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-9">
        {showHeading && (
          <div className="text-center">
            <motion.p
              className="eyebrow text-gold"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Roxford
            </motion.p>
            <h2 className="display mt-6 text-[clamp(2rem,5vw,3.2rem)] font-light text-cream">
              <SplitText text="La carte" />
            </h2>
            <motion.div
              className="rule-gold mx-auto mt-8 h-px w-32 opacity-70"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease }}
            />
          </div>
        )}

        {/* — Filtres : une catégorie à la fois — */}
        {/* Fond opaque : sans lui, le titre de la catégorie se voit
            passer derrière le rail quand on fait défiler. */}
        <div
          ref={tabsRef}
          className={`no-print sticky top-[4.2rem] z-30 -mx-4 scroll-mt-24 bg-wood/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6 ${
            showHeading ? "mt-12" : ""
          }`}
        >
          <div
            ref={railRef}
            className="fade-edges overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="mx-auto flex w-max gap-1 border border-gold/25 bg-wood-deep/90 p-1 backdrop-blur-xl">
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

        {/* — Plats de la catégorie choisie — */}
        <div className="mt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={active || "vide"}
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.38, ease }}
            >
              {current && (
                <div className="mb-8 text-center">
                  <h3 className="display text-xl font-light text-gold-soft sm:text-2xl">
                    {current.name}
                  </h3>
                  {current.description && (
                    <p className="mt-2 text-[13px] italic text-muted">
                      {current.description}
                    </p>
                  )}
                </div>
              )}

              {/*
                Deux colonnes reliées par une arête dorée centrale,
                chaque carte s'y raccrochant par un court filet.
              */}
              <div className="relative grid items-start gap-3 lg:grid-cols-2 lg:gap-x-24 lg:gap-y-4">
                <span
                  aria-hidden
                  className="absolute inset-y-6 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-gold/35 to-transparent lg:block"
                />
                {items.map((item, i) => (
                  <Dish
                    key={item.id}
                    item={item}
                    currency={currency}
                    index={i}
                    reduced={!!reduced}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="mt-16 text-center text-[13px] text-muted">
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
      data-active={isActive}
      className={`relative shrink-0 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors duration-300 ${
        isActive ? "text-wood-deep" : "text-cream-dim/70 hover:text-gold-soft"
      }`}
    >
      {isActive && (
        <motion.span
          layoutId="menu-tab"
          className="absolute inset-0 bg-gold"
          transition={{ type: "spring", stiffness: 360, damping: 32 }}
        />
      )}
      <span className="relative z-10 whitespace-nowrap">{label}</span>
    </button>
  );
}

function Price({
  item,
  currency,
}: {
  item: Product;
  currency: string;
}) {
  if (item.price_variants.length > 0) {
    return (
      <span className="flex shrink-0 gap-3 font-display text-[17px] font-medium tabular-nums text-cheese">
        {item.price_variants.map((v) => (
          <span key={v.label}>
            <span className="mr-1 text-[10px] uppercase tracking-wider text-muted">
              {v.label}
            </span>
            {formatAmount(v.price)}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className="shrink-0 font-display text-[17px] font-medium tabular-nums text-cheese">
      {formatPrice(item.price, currency)}
    </span>
  );
}

function Tags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <ul className="mt-2.5 flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li
          key={tag}
          className="border border-gold/25 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-gold-soft/80"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}

function Dish({
  item,
  currency,
  index,
  reduced,
}: {
  item: Product;
  currency: string;
  index: number;
  reduced: boolean;
}) {
  // Colonne de gauche sur les index pairs : le filet part vers la droite.
  const leftColumn = index % 2 === 0;
  const hasPhoto = Boolean(item.image_url);

  return (
    <motion.article
      className={`group relative border bg-wood-card/80 transition-all duration-400 hover:-translate-y-0.5 hover:bg-wood-soft/80 ${
        hasPhoto ? "overflow-hidden" : ""
      } ${
        item.is_featured
          ? "border-gold/45 shadow-[0_0_34px_-18px_rgba(232,192,106,0.55)]"
          : "border-gold/15 hover:border-gold/40"
      }`}
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.26), ease }}
    >
      {/* Le filet qui rejoint l'arête centrale */}
      <span
        aria-hidden
        className={`absolute top-10 hidden h-px w-12 bg-gradient-to-r from-gold/45 to-transparent lg:block ${
          leftColumn ? "left-full" : "right-full rotate-180"
        }`}
      />

      {/*
        Une photo de plat est ce qui donne envie : quand il y en a une,
        elle occupe toute la largeur de la carte plutôt qu'une pastille
        de 48 px où l'on ne distingue rien.
      */}
      {item.image_url && (
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.2,0,0,1)] group-hover:scale-[1.04]"
            unoptimized
          />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-wood-card/70 to-transparent" />
        </div>
      )}

      <div className="px-5 py-4">
        <div className="flex items-baseline gap-3">
          <h4 className="font-display text-[17px] font-medium tracking-wide text-cream">
            {item.name}
          </h4>

          {item.is_featured && (
            <span className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.18em] text-gold">
              Signature
            </span>
          )}

          <span
            aria-hidden
            className="mx-1 hidden h-px flex-1 self-center border-b border-dotted border-gold/20 sm:block"
          />

          <span className="ml-auto sm:ml-0">
            <Price item={item} currency={currency} />
          </span>
        </div>

        {item.description && (
          <p className="mt-1 text-[13px] leading-relaxed text-cream-dim/60">
            {item.description}
          </p>
        )}

        <Tags tags={item.tags} />
      </div>
    </motion.article>
  );
}
