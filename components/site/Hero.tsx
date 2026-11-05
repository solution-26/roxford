"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import { MapPin, Phone } from "lucide-react";
import { useRef } from "react";
import type { SiteSettings } from "@/lib/types";
import { CheeseHaze, CheesePour } from "./Cheese";

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

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const hero = settings.hero_image_url ?? "/photos/salle-3.png";
  const telHref = settings.phone
    ? `tel:${settings.phone.replace(/\s+/g, "")}`
    : null;

  const container: Variants = {
    hidden: {},
    shown: { transition: { staggerChildren: 0.11, delayChildren: 0.2 } },
  };
  const item: Variants = reduced
    ? { hidden: { opacity: 1 }, shown: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 22 },
        shown: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
      };

  const city = settings.city ?? "Nabeul";

  return (
    <section
      ref={ref}
      id="top"
      className="gold-frame relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden bg-wood-deep"
    >
      {/* — La salle, très assombrie : elle donne la matière, pas le sujet — */}
      <motion.div
        className="absolute inset-0 -z-20"
        style={reduced ? undefined : { y: imageY }}
      >
        <Image
          src={hero}
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-110 object-cover"
        />
      </motion.div>

      <div className="absolute inset-0 -z-10 bg-wood-deep/80" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(90%_70%_at_50%_45%,transparent,rgba(23,14,8,0.92))]" />
      <CheeseHaze />

      <motion.div
        // La marge basse réserve la hauteur de la coulée : sans elle, la
        // parallaxe fait passer les boutons derrière le fromage.
        className="relative mx-auto w-full max-w-[1180px] px-8 pb-40 pt-28 text-center sm:px-14 sm:pb-52 lg:pb-60"
        style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}
        variants={container}
        initial="hidden"
        animate="shown"
      >
        <motion.p variants={item} className="eyebrow text-gold-soft">
          <span className="inline-flex items-center gap-2.5">
            <span className="relative flex h-1.5 w-1.5">
              {isOpen && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cheese opacity-70" />
              )}
              <span
                className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                  isOpen ? "bg-cheese" : "bg-muted"
                }`}
              />
            </span>
            {openLabel}
          </span>
        </motion.p>

        <motion.h1
          variants={item}
          className="display mx-auto mt-10 max-w-4xl text-[clamp(2.1rem,6.6vw,4.6rem)] font-light text-cream"
        >
          {settings.restaurant_name}.
          <br />
          {city}.
          <br />
          <span className="text-gold-soft">Instants fondants.</span>
        </motion.h1>

        <motion.div
          variants={item}
          className="rule-gold mx-auto mt-10 h-px w-40 opacity-70"
        />

        {settings.description && (
          <motion.p
            variants={item}
            className="mx-auto mt-8 max-w-lg text-[15px] leading-relaxed text-cream-dim/80"
          >
            {settings.description}
          </motion.p>
        )}

        <motion.div
          variants={item}
          className="mt-11 flex flex-wrap items-center justify-center gap-3"
        >
          {telHref && (
            <a
              href={telHref}
              className="group relative inline-flex items-center gap-2.5 overflow-hidden border border-gold/60 px-8 py-4 text-[12px] font-medium uppercase tracking-[0.22em] text-gold-pale transition-colors duration-500 hover:border-gold hover:text-wood-deep"
            >
              {/* L'or envahit le bouton depuis le bas */}
              <span className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-gold transition-transform duration-500 ease-[cubic-bezier(.2,0,0,1)] group-hover:scale-y-100" />
              <Phone size={14} strokeWidth={2} />
              Réserver une table
            </a>
          )}

          {settings.maps_url && (
            <a
              href={settings.maps_url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 px-5 py-4 text-[12px] font-medium uppercase tracking-[0.22em] text-cream-dim/70 transition-colors hover:text-cream"
            >
              <MapPin size={14} />
              Itinéraire
            </a>
          )}
        </motion.div>
      </motion.div>

      {/* — La coulée déborde du héros sur la section suivante — */}
      <div className="absolute inset-x-0 bottom-0 z-10 translate-y-[1px]">
        <CheesePour />
      </div>
    </section>
  );
}
