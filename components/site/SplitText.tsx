"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

/**
 * Titre révélé mot par mot au défilement.
 *
 * On découpe par mots, pas par lettres : les lecteurs d'écran et la
 * césure restent corrects, et le rendu est plus lisible sur les longs
 * titres français.
 */
export function SplitText({
  text,
  className,
  highlight,
  highlightClassName = "text-gold-soft",
  delay = 0,
}: {
  text: string;
  className?: string;
  /** Mots à mettre en valeur, comparés sans ponctuation ni casse. */
  highlight?: string[];
  highlightClassName?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  const normalise = (w: string) =>
    w.toLowerCase().replace(/[.,;:!?'’"]/g, "");
  const accent = new Set((highlight ?? []).map(normalise));

  if (reduced) {
    return (
      <span className={className}>
        {words.map((word, i) => (
          <span
            key={i}
            className={accent.has(normalise(word)) ? highlightClassName : undefined}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    );
  }

  const container: Variants = {
    hidden: {},
    shown: { transition: { staggerChildren: 0.055, delayChildren: delay } },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: "0.45em", rotate: 2 },
    shown: {
      opacity: 1,
      y: "0em",
      rotate: 0,
      transition: { duration: 0.62, ease: [0.2, 0, 0, 1] },
    },
  };

  return (
    <motion.span
      className={className}
      variants={container}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-70px" }}
      style={{ display: "inline-block" }}
    >
      {words.map((word, i) => (
        <span
          key={i}
          style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}
        >
          <motion.span
            variants={item}
            style={{ display: "inline-block" }}
            className={accent.has(normalise(word)) ? highlightClassName : undefined}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </motion.span>
  );
}
