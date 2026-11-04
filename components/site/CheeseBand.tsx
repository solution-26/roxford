"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { SplitText } from "./SplitText";

/**
 * Bande photographique pleine largeur.
 *
 * L'image se déplace plus lentement que la page et se dézoome
 * légèrement : la scène respire au défilement sans que rien ne bouge
 * brusquement. C'est la seule animation de la section — une photo
 * appétissante n'a pas besoin d'être décorée.
 *
 * Photo : Brelyn Bashrum (Unsplash). À remplacer par une photo du
 * restaurant dès qu'elle est disponible.
 */
export function CheeseBand() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-11%", "11%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.18, 1.08, 1.18]);

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[26rem] items-end overflow-hidden bg-night sm:min-h-[32rem] lg:min-h-[38rem]"
    >
      <motion.div
        className="absolute inset-0 -z-10"
        style={reduced ? undefined : { y, scale }}
      >
        <Image
          src="/photos/fromage-filant.jpg"
          alt="Une part de pizza soulevée, le fromage s'étire encore"
          fill
          sizes="100vw"
          quality={72}
          className="object-cover object-center"
        />
      </motion.div>

      {/* Lisibilité du texte sans éteindre la photo */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/45 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-night/75 via-transparent to-transparent" />

      <div className="mx-auto w-full max-w-[1180px] px-4 pb-14 sm:px-6 sm:pb-20 lg:px-9">
        <motion.div
          className="h-px w-24 origin-left bg-brass"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.2, 0, 0, 1] }}
        />

        <h2 className="mt-6 max-w-xl font-display text-[clamp(1.9rem,4.6vw,3rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-cream">
          <SplitText
            text="Gratiné au four, servi brûlant"
            highlight={["brûlant"]}
            highlightClassName="text-cheese"
          />
        </h2>

        <motion.p
          className="mt-4 max-w-md text-[15px] leading-relaxed text-cream/70"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Pizzas, gratins et sandwichs sortent du four au bon moment — ni
          avant, ni après.
        </motion.p>
      </div>
    </section>
  );
}
