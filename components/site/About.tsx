import Image from "next/image";
import { Anchor, Clock, Users, Wind } from "lucide-react";
import { Reveal } from "./Reveal";
import type { SiteSettings } from "@/lib/types";

const ICONS = [Wind, Anchor, Clock, Users];

export function About({ settings }: { settings: SiteSettings }) {
  const name = settings.restaurant_name;

  return (
    <section
      id="maison"
      className="grain relative overflow-hidden bg-cream py-20 sm:py-28 lg:py-32"
    >
      <div className="mx-auto grid max-w-[1180px] items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-20 lg:px-9">
        {/* — Colonne texte — */}
        <div>
          <Reveal>
            <p className="eyebrow text-brass">La maison</p>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="mt-5 font-display text-[clamp(2.2rem,5.5vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink">
              Une salle qui a
              <span className="text-aqua"> le goût du large</span>
            </h2>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="mt-8 space-y-5 text-ink-2">
              <p>
                Boiseries de noyer, hublots cerclés de laiton, lustres de
                papier froissé et aquariums qui éclairent les banquettes :
                chez {name}, on dîne comme à bord. Le décor a été pensé
                comme une traversée, et la carte suit la même idée — simple,
                généreuse, sans détour.
              </p>
              <p>
                On vient y déjeuner vite, s&apos;attabler en famille le soir,
                ou s&apos;installer en terrasse quand la soirée est douce.
                Tout est préparé minute, et le service tient jusqu&apos;à la
                fermeture.
              </p>
            </div>
          </Reveal>

          {settings.features.length > 0 && (
            <Reveal delay={0.24}>
              <ul className="mt-10 grid gap-3 sm:grid-cols-2">
                {settings.features.map((feature, i) => {
                  const Icon = ICONS[i % ICONS.length];
                  return (
                    <li
                      key={feature}
                      className="flex items-center gap-3 rounded-2xl border border-line-soft bg-surface px-4 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brass/45 hover:shadow-[0_14px_34px_-22px_rgba(32,25,20,0.6)]"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-aqua/10 text-aqua">
                        <Icon size={17} strokeWidth={2.1} />
                      </span>
                      <span className="text-sm font-medium text-ink">
                        {feature}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          )}
        </div>

        {/* — Colonne images : composition en hublots — */}
        <div className="relative mx-auto w-full max-w-[32rem]">
          <Reveal direction="left">
            <div className="porthole relative aspect-square overflow-hidden">
              <Image
                src="/photos/salle-1.png"
                alt="Les hublots de bois et les banquettes de la salle"
                fill
                sizes="(max-width: 1024px) 85vw, 480px"
                className="object-cover"
              />
            </div>
          </Reveal>

          <Reveal delay={0.18} direction="right">
            <div className="porthole absolute -bottom-8 -left-4 aspect-square w-[42%] overflow-hidden sm:-left-10">
              <Image
                src="/photos/vitrine-marine.png"
                alt="Vitrine d'objets marins : maquettes, hublot de laiton, scaphandre"
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
          </Reveal>

          {/* Petite boussole décorative */}
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            className="absolute -right-3 -top-5 h-20 w-20 text-brass/45 sm:-right-7"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              cx="50"
              cy="50"
              r="34"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
            />
            <path d="M50 10 L57 50 L50 90 L43 50 Z" fill="currentColor" />
            <path
              d="M10 50 L50 43 L90 50 L50 57 Z"
              fill="currentColor"
              opacity="0.45"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
