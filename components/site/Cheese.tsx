"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";

/* ================================================================
   Coulées de fromage.

   Le fromage est ce que le lieu sait faire : il mérite une matière,
   pas un aplat. D'où le dégradé à trois arrêts (crème en haut, or
   au ventre, brun au bord), le reflet en biais et les gouttes qui
   s'étirent à des rythmes différents.
   ================================================================ */

/**
 * Grande coulée, posée au bas du héros : elle déborde de la photo
 * sur la section suivante.
 */
export function CheesePour({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const id = useId().replace(/:/g, "");

  // x, demi-largeur, longueur au repos, durée, retard.
  // Les abscisses tombent sur les creux du bord, et les gouttes sont
  // nettement plus longues que larges : une goutte trop ronde se lit
  // comme une bulle détachée, pas comme du fromage qui coule.
  const drips = [
    { x: 120, r: 10, len: 86, dur: 6.5, delay: 0.2 },
    { x: 318, r: 7, len: 54, dur: 8, delay: 1.7 },
    { x: 520, r: 12, len: 124, dur: 7.2, delay: 0.6 },
    { x: 726, r: 8, len: 64, dur: 9, delay: 2.4 },
    { x: 930, r: 11, len: 102, dur: 6.8, delay: 1.1 },
    { x: 1140, r: 7, len: 50, dur: 8.4, delay: 3 },
    { x: 1330, r: 9, len: 78, dur: 7.6, delay: 0.9 },
  ];

  // Haut des gouttes, bien à l'intérieur de la masse : le raccord
  // disparaît et la coulée se lit d'un seul tenant.
  const TOP = 62;

  return (
    <div
      aria-hidden
      className={`pointer-events-none w-full select-none ${className ?? ""}`}
      style={{ lineHeight: 0 }}
    >
      <svg
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        className="block h-[90px] w-full sm:h-[130px] lg:h-[160px]"
      >
        <defs>
          <linearGradient id={`body-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8ecc6" />
            <stop offset="42%" stopColor="#efcf85" />
            <stop offset="78%" stopColor="#dca94f" />
            <stop offset="100%" stopColor="#bf8a2c" />
          </linearGradient>

          {/* Reflet en biais, comme sur du fromage encore brillant */}
          <linearGradient id={`sheen-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff8e2" stopOpacity="0.62" />
            <stop offset="38%" stopColor="#fff8e2" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#fff8e2" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Les gouttes passent dessous : elles semblent sortir de la masse */}
        {drips.map((drip, i) => (
          <motion.ellipse
            key={i}
            cx={drip.x}
            cy={TOP + drip.len / 2}
            rx={drip.r}
            ry={drip.len / 2}
            fill={`url(#body-${id})`}
            style={{ originY: 0, transformBox: "fill-box" }}
            animate={reduced ? undefined : { scaleY: [1, 1.6, 1] }}
            transition={{
              duration: drip.dur,
              delay: drip.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Masse principale : des lobes irréguliers, jamais une vague */}
        <path
          fill={`url(#body-${id})`}
          d="M0 0 H1440 V52
             C 1400 52, 1392 104, 1330 102
             S 1252 46, 1200 52
             C 1166 56, 1160 98, 1140 97
             C 1108 95, 1098 48, 1040 54
             S 976 104, 930 102
             S 862 48, 820 54
             C 788 58, 782 96, 726 95
             S 660 46, 616 52
             C 580 57, 572 108, 520 106
             S 440 44, 398 50
             C 366 55, 360 96, 318 95
             S 250 45, 206 51
             C 172 56, 166 100, 120 98
             S 44 46, 0 52 Z"
        />

        {/* Reflet : suit le haut de la masse */}
        <path
          fill={`url(#sheen-${id})`}
          d="M0 0 H1440 V34
             C 1160 50, 980 24, 720 40
             S 280 22, 0 38 Z"
        />
      </svg>
    </div>
  );
}

/**
 * Coulée fine, pour séparer deux sections sans les écraser.
 * `background` est la couleur de la section du dessous.
 */
export function CheeseDrip({
  from = "var(--color-cheese)",
  background = "transparent",
  className,
}: {
  from?: string;
  background?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const id = useId().replace(/:/g, "");

  const drops = [
    { x: 108, r: 9, len: 22, dur: 5.5, delay: 0 },
    { x: 286, r: 6, len: 14, dur: 7, delay: 1.4 },
    { x: 464, r: 11, len: 30, dur: 6.2, delay: 0.6 },
    { x: 642, r: 7, len: 18, dur: 8, delay: 2.1 },
    { x: 820, r: 10, len: 26, dur: 5.8, delay: 1 },
    { x: 998, r: 6, len: 16, dur: 7.4, delay: 2.6 },
    { x: 1176, r: 9, len: 21, dur: 6.6, delay: 0.3 },
  ];
  const TOP = 50;

  return (
    <div
      aria-hidden
      className={`pointer-events-none relative -mt-px w-full select-none ${
        className ?? ""
      }`}
      style={{ lineHeight: 0, background }}
    >
      <svg
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        className="block h-[44px] w-full sm:h-[62px]"
      >
        <defs>
          <linearGradient id={`d-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={from} stopOpacity="0.82" />
          </linearGradient>
        </defs>

        {drops.map((drop, i) => (
          <motion.ellipse
            key={i}
            cx={drop.x}
            cy={TOP + drop.len / 2}
            rx={drop.r}
            ry={drop.len / 2}
            fill={`url(#d-${id})`}
            style={{ originY: 0, transformBox: "fill-box" }}
            animate={reduced ? undefined : { scaleY: [1, 1.5, 1] }}
            transition={{
              duration: drop.dur,
              delay: drop.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        <path
          fill={`url(#d-${id})`}
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
      </svg>
    </div>
  );
}

/** Halos chauds qui dérivent très lentement derrière le héros. */
export function CheeseHaze() {
  const reduced = useReducedMotion();
  if (reduced) return null;

  const halos = [
    { left: "10%", top: "22%", size: 170, dur: 21, delay: 0 },
    { left: "74%", top: "18%", size: 110, dur: 25, delay: 2 },
    { left: "56%", top: "62%", size: 200, dur: 29, delay: 1 },
    { left: "86%", top: "54%", size: 84, dur: 23, delay: 3.5 },
  ];

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-[5] overflow-hidden"
    >
      {halos.map((halo, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: halo.left,
            top: halo.top,
            width: halo.size,
            height: halo.size,
            background:
              "radial-gradient(circle at 34% 30%, rgba(240,220,174,0.14), rgba(201,162,39,0.05) 56%, transparent 72%)",
          }}
          animate={{ y: [0, -28, 0], x: [0, 16, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{
            duration: halo.dur,
            delay: halo.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
