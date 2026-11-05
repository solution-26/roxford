"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { SplitText } from "./SplitText";

const ease = [0.2, 0, 0, 1] as const;

/** Petit caquelon d'où coule un filet — la vignette d'or du bloc de texte. */
function PotIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 40" aria-hidden className={className} fill="none">
      <path
        d="M9 12 C9 10 10 9 12 9 H30 C32 9 33 10 33 12 V18 C33 24 29 28 23 28 H19 C13 28 9 24 9 18 Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M33 13 C39 13 42 15 42 18" stroke="currentColor" strokeWidth="1.4" />
      {/* Le filet qui tombe */}
      <path
        d="M21 28 C21 32 20 34 20 37"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <ellipse cx="20" cy="38.4" rx="1.6" ry="1.4" fill="currentColor" />
    </svg>
  );
}

/** Une tuile photo : apparition au défilement, léger zoom au survol. */
function Tile({
  src,
  alt,
  className,
  delay = 0,
  sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  delay?: number;
  sizes: string;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.figure
      className={`group relative overflow-hidden ${className ?? ""}`}
      initial={reduced ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.75, delay, ease }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(.2,0,0,1)] group-hover:scale-[1.06]"
      />
      {/* Les photos sont claires : on les assombrit pour tenir avec le bois */}
      <span className="pointer-events-none absolute inset-0 bg-wood-deep/25 transition-opacity duration-700 group-hover:opacity-0" />
      <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-gold/15" />
    </motion.figure>
  );
}

export function CheeseCore() {
  return (
    <section
      id="fromage"
      className="wood-deep grain relative overflow-hidden py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        {/*
          Mosaïque : deux photos hautes à gauche, le texte au centre,
          deux photos empilées à droite. Sur mobile tout se remet en
          colonne, le texte d'abord.
        */}
        <div className="grid gap-3 lg:grid-cols-12 lg:grid-rows-2 lg:gap-4">
          <Tile
            src="/photos/fondue.jpg"
            alt="Un morceau de pain plongé dans un caquelon de fromage fondu"
            sizes="(max-width: 1024px) 50vw, 18vw"
            className="order-2 aspect-[3/4] lg:order-none lg:col-span-2 lg:row-span-2 lg:aspect-auto"
          />

          <Tile
            src="/photos/raclette.jpg"
            alt="Fromage fondu nappant des pommes de terre"
            delay={0.08}
            sizes="(max-width: 1024px) 50vw, 24vw"
            className="order-3 aspect-[3/4] lg:order-none lg:col-span-3 lg:row-span-2 lg:aspect-auto"
          />

          {/* — Le texte — */}
          <div className="order-1 flex flex-col items-center justify-center px-2 py-10 text-center lg:order-none lg:col-span-3 lg:row-span-2 lg:px-6 lg:py-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
            >
              <PotIcon className="h-11 w-11 text-gold" />
            </motion.div>

            <h2 className="display mt-7 text-[clamp(1.6rem,3.4vw,2.4rem)] font-light text-cream">
              <SplitText
                text="Le fromage au cœur"
                highlight={["fromage"]}
                highlightClassName="text-gold-soft"
              />
            </h2>

            <motion.p
              className="mt-6 max-w-xs text-[14px] leading-relaxed text-cream-dim/75"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Tout part de là. On le choisit, on le dose, on le laisse fondre
              jusqu&apos;au bon moment — c&apos;est ce qui tient une pizza, un
              gratin ou un cordon bleu.
            </motion.p>

            <motion.div
              className="rule-gold mt-8 h-px w-16 opacity-60"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.45, ease }}
            />
          </div>

          <Tile
            src="/photos/fromage-filant.jpg"
            alt="Une part de pizza soulevée, le fromage s'étire encore"
            delay={0.16}
            sizes="(max-width: 1024px) 100vw, 34vw"
            className="order-4 aspect-[16/9] lg:order-none lg:col-span-4 lg:aspect-auto"
          />

          <Tile
            src="/photos/gratin.jpg"
            alt="Un gratin sortant du four, croûte de fromage dorée"
            delay={0.24}
            sizes="(max-width: 1024px) 100vw, 34vw"
            className="order-5 aspect-[16/9] lg:order-none lg:col-span-4 lg:aspect-auto"
          />
        </div>
      </div>
    </section>
  );
}
