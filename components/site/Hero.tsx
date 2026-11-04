"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import { ArrowDown, MapPin, Phone, UtensilsCrossed } from "lucide-react";
import { useRef } from "react";
import type { SiteSettings } from "@/lib/types";
import { CheeseHaze } from "./Cheese";

const ease = [0.2, 0, 0, 1] as const;

export function Hero({
  settings,
  openLabel,
  isOpen,
}: {
  settings: SiteSettings;
  openLabel: string;
  isOpen: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallaxe : l'image descend plus lentement que le texte.
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "38%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const hero = settings.hero_image_url ?? "/photos/salle-3.png";
  const telHref = settings.phone
    ? `tel:${settings.phone.replace(/\s+/g, "")}`
    : null;

  const container: Variants = {
    hidden: {},
    shown: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
  };

  // En mode « moins d'animations », les éléments apparaissent sans glisser.
  const item: Variants = reduced
    ? { hidden: { opacity: 1 }, shown: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 26 },
        shown: { opacity: 1, y: 0, transition: { duration: 0.85, ease } },
      };

  return (
    <section
      ref={ref}
      id="top"
      className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-night"
    >
      {/* — Photographie de la salle — */}
      <motion.div
        className="absolute inset-0 -z-20"
        style={reduced ? undefined : { y: imageY }}
      >
        <Image
          src={hero}
          alt="La salle du restaurant"
          fill
          priority
          sizes="100vw"
          className="scale-110 object-cover"
        />
      </motion.div>

      {/* — Voiles successifs : le texte reste lisible à gauche, le décor
            de la salle reste visible à droite. — */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-night/92 via-night/55 to-night/20" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/40 to-night/15" />

      {/* Trous d'emmental en suspension — la spécialité, en sourdine */}
      <CheeseHaze />

      <motion.div
        className="relative mx-auto w-full max-w-[1180px] px-4 pb-28 pt-36 sm:px-6 lg:px-9"
        style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}
        variants={container}
        initial="hidden"
        animate="shown"
      >
        {/* Pastille d'état, calculée sur le fuseau de Nabeul */}
        <motion.div variants={item} className="mb-7">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-cream/25 bg-night/45 px-4 py-2 text-[13px] font-medium text-cream backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              {isOpen && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              )}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  isOpen ? "bg-emerald-400" : "bg-brass-soft"
                }`}
              />
            </span>
            {openLabel}
          </span>
        </motion.div>

        <motion.p
          variants={item}
          className="eyebrow mb-5 text-brass-soft"
        >
          {settings.city ?? "Nabeul"} · {settings.tagline}
        </motion.p>

        <motion.h1
          variants={item}
          className="font-display text-[clamp(3.5rem,13vw,9rem)] font-semibold leading-[0.88] tracking-[-0.035em] text-cream"
        >
          {settings.restaurant_name}
        </motion.h1>

        <motion.div
          variants={item}
          className="rule-brass mt-8 h-px w-full max-w-md origin-left"
        />

        {settings.description && (
          <motion.p
            variants={item}
            className="mt-7 max-w-xl text-[17px] leading-relaxed text-cream/80"
          >
            {settings.description}
          </motion.p>
        )}

        <motion.div
          variants={item}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <a
            href="#carte"
            className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-brass px-7 py-4 font-semibold text-night transition-colors duration-300 hover:bg-brass-soft"
          >
            {/* Reflet qui balaie le bouton au survol */}
            <span className="pointer-events-none absolute inset-0 -translate-x-[120%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 group-hover:translate-x-[260%]" />
            <UtensilsCrossed size={18} strokeWidth={2.2} />
            Découvrir la carte
          </a>

          {telHref && (
            <a
              href={telHref}
              className="inline-flex items-center gap-2.5 rounded-full border border-cream/30 bg-cream/10 px-7 py-4 font-semibold text-cream backdrop-blur-md transition-all duration-300 hover:border-cream/55 hover:bg-cream/20"
            >
              <Phone size={17} strokeWidth={2.2} />
              {settings.phone}
            </a>
          )}

          {settings.maps_url && (
            <a
              href={settings.maps_url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 px-2 py-4 text-sm font-medium text-cream/70 underline-offset-4 transition-colors hover:text-cream hover:underline"
            >
              <MapPin size={16} />
              Itinéraire
            </a>
          )}
        </motion.div>

        {/* Bandeau d'informations courtes */}
        <motion.ul
          variants={item}
          className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-cream/15 pt-6 text-sm text-cream/65"
        >
          {settings.price_range && (
            <li>
              <span className="text-cream/45">Budget</span>{" "}
              <span className="font-semibold text-cream/90">
                {settings.price_range}
              </span>
            </li>
          )}
          {settings.features.slice(0, 3).map((f) => (
            <li key={f} className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-brass" />
              {f}
            </li>
          ))}
        </motion.ul>
      </motion.div>

      {/* Invitation à faire défiler */}
      <motion.a
        href="#maison"
        aria-label="Faire défiler"
        className="no-print absolute bottom-7 left-1/2 z-10 -translate-x-1/2 rounded-full border border-cream/25 p-3 text-cream/70 backdrop-blur-md transition-colors hover:text-cream"
        animate={reduced ? undefined : { y: [0, 7, 0] }}
        transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowDown size={17} />
      </motion.a>
    </section>
  );
}
