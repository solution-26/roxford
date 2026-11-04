"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";

/* ================================================================
   Le fromage est la spécialité de Roxford : il sert ici de fil
   conducteur visuel, pas de décoration posée au hasard.
   ================================================================ */

/**
 * Coulée de fromage fondu entre deux sections.
 *
 * `from` est la couleur de la section du dessus : la coulée semble
 * déborder dessus. Les gouttes tombent en boucle, à des rythmes
 * volontairement différents pour éviter l'effet mécanique.
 */
export function CheeseDrip({
  from = "var(--color-cream)",
  background = "transparent",
  flip = false,
  className,
}: {
  /** Couleur de la coulée elle-même. */
  from?: string;
  /** Couleur de la section du dessous, visible entre les gouttes. */
  background?: string;
  /** Retourne la coulée pour une section qui remonte. */
  flip?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const id = useId().replace(/:/g, "");

  // Gouttes. Les abscisses tombent sur les creux du bord fondu, sinon
  // elles flottent sous le vide. `len` est la longueur au repos ;
  // l'étirement part du haut de la goutte, qui chevauche le bord.
  // Les creux du bord fondu, là où le fromage s'accumule et tombe.
  const drops = [
    { x: 108, r: 10, len: 24, dur: 5.5, delay: 0 },
    { x: 286, r: 7, len: 15, dur: 7, delay: 1.4 },
    { x: 464, r: 12, len: 32, dur: 6.2, delay: 0.6 },
    { x: 642, r: 8, len: 19, dur: 8, delay: 2.1 },
    { x: 820, r: 11, len: 28, dur: 5.8, delay: 1 },
    { x: 998, r: 7, len: 17, dur: 7.4, delay: 2.6 },
    { x: 1176, r: 10, len: 23, dur: 6.6, delay: 0.3 },
  ];

  /** Le haut de chaque goutte reste accroché au bord fondu. */
  const TOP = 50;

  return (
    <div
      aria-hidden
      className={`pointer-events-none relative -mt-px w-full select-none ${
        flip ? "rotate-180" : ""
      } ${className ?? ""}`}
      style={{ lineHeight: 0, background }}
    >
      <svg
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        className="block h-[52px] w-full sm:h-[72px]"
      >
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={from} />
          </linearGradient>
        </defs>

        {/* Bord fondu : des lobes irréguliers plutôt qu'une vague régulière */}
        <path
          fill={`url(#g-${id})`}
          d="M0 0 H1440 V30
             C 1400 30, 1390 56, 1350 56
             S 1300 26, 1258 30
             C 1220 34, 1216 62, 1176 60
             S 1120 28, 1078 32
             C 1040 36, 1038 58, 998 57
             S 942 27, 900 31
             C 862 35, 860 64, 820 62
             S 764 28, 722 32
             C 684 36, 682 57, 642 56
             S 586 26, 544 30
             C 506 34, 504 63, 464 61
             S 408 27, 366 31
             C 328 35, 326 58, 286 57
             S 230 27, 188 31
             C 150 35, 148 60, 108 58
             S 42 28, 0 32 Z"
        />

        {/* Gouttes qui s'étirent puis se détachent */}
        {drops.map((drop, i) => (
          <motion.ellipse
            key={i}
            cx={drop.x}
            cy={TOP + drop.len / 2}
            rx={drop.r}
            ry={drop.len / 2}
            fill={from}
            style={{ originY: 0, transformBox: "fill-box" }}
            animate={
              reduced
                ? undefined
                : { scaleY: [1, 1.55, 1], opacity: [1, 1, 1] }
            }
            transition={{
              duration: drop.dur,
              delay: drop.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

/**
 * Part de fromage. Sert de puce aux spécialités et d'accent de titre.
 */
export function CheeseWedge({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
      className={className}
    >
      {/* Triangle de meule, croûte plus foncée en haut */}
      <path
        d="M3 18 L19.5 5.5 C21 7.5 21.5 10 21 12.5 L6.5 20 C5 19.8 3.8 19.2 3 18 Z"
        fill="currentColor"
      />
      <path
        d="M19.5 5.5 C21 7.5 21.5 10 21 12.5 L17.5 14.3 C18 11.6 17.4 9.1 15.8 7.2 Z"
        fill="currentColor"
        opacity="0.45"
      />
      {/* Les trous */}
      <circle cx="8.6" cy="16.4" r="1.5" fill="var(--color-cream)" />
      <circle cx="13.2" cy="13" r="1.1" fill="var(--color-cream)" />
      <circle cx="11" cy="17.6" r="0.8" fill="var(--color-cream)" />
    </svg>
  );
}

/**
 * Trous d'emmental qui dérivent lentement en fond de héros.
 * Volontairement très discrets : on doit les sentir, pas les voir.
 */
export function CheeseHaze() {
  const reduced = useReducedMotion();
  if (reduced) return null;

  const holes = [
    { left: "8%", top: "24%", size: 150, dur: 19, delay: 0 },
    { left: "72%", top: "16%", size: 100, dur: 23, delay: 2 },
    { left: "58%", top: "66%", size: 190, dur: 27, delay: 1 },
    { left: "88%", top: "52%", size: 76, dur: 21, delay: 3.5 },
    { left: "30%", top: "78%", size: 120, dur: 25, delay: 4.5 },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-[5] overflow-hidden">
      {holes.map((hole, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: hole.left,
            top: hole.top,
            width: hole.size,
            height: hole.size,
            background:
              "radial-gradient(circle at 34% 30%, rgba(244,211,136,0.16), rgba(232,178,74,0.05) 58%, transparent 72%)",
          }}
          animate={{
            y: [0, -26, 0],
            x: [0, 14, 0],
            opacity: [0.5, 0.9, 0.5],
          }}
          transition={{
            duration: hole.dur,
            delay: hole.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/**
 * Filaments de fromage qui s'étirent au survol d'une spécialité.
 * Rendu uniquement au survol du parent (classe `group`).
 */
export function CheesePull() {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <svg
      aria-hidden
      viewBox="0 0 40 24"
      className="pointer-events-none absolute -top-1 left-1/2 h-5 w-10 -translate-x-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
    >
      {[
        { d: "M8 0 C 9 9, 7 15, 10 23", delay: 0 },
        { d: "M20 0 C 21 10, 18 17, 21 23", delay: 0.12 },
        { d: "M31 0 C 32 8, 30 16, 33 23", delay: 0.24 },
      ].map((strand, i) => (
        <motion.path
          key={i}
          d={strand.d}
          fill="none"
          stroke="var(--color-cheese)"
          strokeWidth="1.6"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.9 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: strand.delay }}
        />
      ))}
    </svg>
  );
}
