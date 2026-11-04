"use client";

import { motion, useReducedMotion } from "motion/react";
import { CheeseWedge } from "./Cheese";
import { SplitText } from "./SplitText";

const POINTS = [
  {
    title: "Pizzas gratinées",
    body: "Mozzarella généreuse, cuisson au four jusqu'à la croûte dorée. La Quatre Fromages est notre carte de visite.",
  },
  {
    title: "Sandwichs fondants",
    body: "Le fromage fond sur la plaque avec la garniture — c'est ce qui fait tenir un Cordon Bleu ou un Meat Lovers.",
  },
  {
    title: "Gratins & pâtes",
    body: "Gratin de fruits de mer, lasagnes, tagliatelles : tout passe sous le gril avant de sortir en salle.",
  },
];

export function CheeseSection() {
  const reduced = useReducedMotion();

  return (
    <section
      id="fromage"
      className="relative overflow-hidden bg-walnut-deep py-20 sm:py-24 lg:py-28"
    >
      {/* Halo chaud derrière la meule */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-10%] top-1/2 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full opacity-45"
        style={{
          background:
            "radial-gradient(circle, rgba(232,178,74,0.32), transparent 68%)",
        }}
      />

      <div className="mx-auto grid max-w-[1180px] items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:px-9">
        <div>
          <motion.p
            className="eyebrow flex items-center gap-2 text-cheese"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <CheeseWedge size={15} className="text-cheese" />
            La spécialité
          </motion.p>

          <h2 className="mt-5 font-display text-[clamp(2.1rem,5.2vw,3.4rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-cream">
            <SplitText
              text="Ici, le fromage n’est pas un supplément"
              highlight={["fromage"]}
              highlightClassName="text-cheese"
            />
          </h2>

          <motion.p
            className="mt-7 max-w-lg text-sand/75"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            C&apos;est le point de départ de presque toute la carte. On le
            choisit, on le dose, et on le laisse fondre jusqu&apos;au bon
            moment — ni avant, ni après.
          </motion.p>

          <ul className="mt-10 space-y-3">
            {POINTS.map((point, i) => (
              <motion.li
                key={point.title}
                className="group rounded-2xl border border-cheese/20 bg-cheese/[0.06] p-5 transition-colors duration-300 hover:border-cheese/50 hover:bg-cheese/[0.11]"
                initial={reduced ? false : { opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.55, delay: 0.1 + i * 0.12 }}
              >
                <h3 className="flex items-center gap-2.5 font-display text-lg font-semibold text-cream">
                  <CheeseWedge
                    size={17}
                    className="text-cheese transition-transform duration-500 group-hover:rotate-12"
                  />
                  {point.title}
                </h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-sand/70">
                  {point.body}
                </p>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* — La meule — */}
        <div className="relative mx-auto aspect-square w-full max-w-sm">
          <motion.div
            className="absolute inset-0"
            animate={reduced ? undefined : { rotate: 360 }}
            transition={{ duration: 95, repeat: Infinity, ease: "linear" }}
          >
            <svg viewBox="0 0 200 200" className="h-full w-full">
              <defs>
                <radialGradient id="rind" cx="38%" cy="32%">
                  <stop offset="0%" stopColor="#f4d388" />
                  <stop offset="62%" stopColor="#e8b24a" />
                  <stop offset="100%" stopColor="#c2871f" />
                </radialGradient>
              </defs>

              <circle cx="100" cy="100" r="86" fill="url(#rind)" />
              <circle
                cx="100"
                cy="100"
                r="86"
                fill="none"
                stroke="#a8721a"
                strokeWidth="3"
              />
              <circle
                cx="100"
                cy="100"
                r="76"
                fill="none"
                stroke="#a8721a"
                strokeWidth="1"
                opacity="0.4"
              />

              {/* La part prélevée */}
              <path
                d="M100 100 L186 100 A86 86 0 0 0 160 39 Z"
                fill="#33241a"
                opacity="0.9"
              />

              {/* Les trous, dispersés sans régularité */}
              {[
                [72, 68, 10],
                [118, 128, 13],
                [62, 122, 8],
                [132, 72, 7],
                [96, 96, 6],
                [86, 146, 9],
                [146, 112, 6],
                [52, 94, 5],
                [112, 52, 5],
              ].map(([cx, cy, r], i) => (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="#c2871f"
                  opacity="0.55"
                />
              ))}
            </svg>
          </motion.div>

          {/* Parts qui flottent autour de la meule */}
          {[
            { top: "2%", left: "4%", size: 42, dur: 7, delay: 0 },
            { top: "72%", left: "-4%", size: 30, dur: 9, delay: 1.2 },
            { top: "84%", left: "74%", size: 36, dur: 8, delay: 0.6 },
          ].map((wedge, i) => (
            <motion.div
              key={i}
              className="absolute text-cheese-soft drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)]"
              style={{ top: wedge.top, left: wedge.left }}
              animate={
                reduced ? undefined : { y: [0, -14, 0], rotate: [0, 9, 0] }
              }
              transition={{
                duration: wedge.dur,
                delay: wedge.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <CheeseWedge size={wedge.size} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
