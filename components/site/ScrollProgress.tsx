"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Filet de progression en haut de page — une coulée de fromage qui avance. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="no-print fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-gradient-to-r from-cheese-deep via-cheese to-brass-soft"
    />
  );
}
