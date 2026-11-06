"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { Menu, Phone, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const LINKS = [
  { hash: "#carte", label: "La carte" },
  { hash: "#galerie", label: "La salle" },
  { hash: "#visite", label: "Nous trouver" },
];

/**
 * Sur la page d'accueil, les liens font défiler. Ailleurs (la page
 * carte), ils renvoient vers l'accueil au bon endroit — sauf « La
 * carte », qui pointe alors sur la page dédiée.
 */
function resolve(hash: string, onHome: boolean) {
  if (onHome) return hash;
  return hash === "#carte" ? "/carte" : `/${hash}`;
}

export function Header({
  name,
  logoUrl,
  phone,
}: {
  name: string;
  logoUrl: string | null;
  phone: string | null;
}) {
  const [condensed, setCondensed] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const onHome = usePathname() === "/";

  useMotionValueEvent(scrollY, "change", (y) => setCondensed(y > 40));

  /**
   * Section à l'écran, pour allumer le lien correspondant.
   * Uniquement sur l'accueil : ailleurs les liens quittent la page.
   */
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    if (!onHome) return;

    const ids = LINKS.map((l) => l.hash.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // La section la plus visible l'emporte : plusieurs peuvent se
        // croiser à l'écran pendant le défilement.
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best) setCurrent(best.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [onHome]);

  const telHref = phone ? `tel:${phone.replace(/\s+/g, "")}` : null;

  return (
    <>
      <header
        className={`no-print fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          condensed
            ? "border-b border-gold/20 bg-wood-deep/92 py-2 backdrop-blur-xl"
            : "border-b border-transparent py-5"
        }`}
      >
        <div className="mx-auto flex max-w-[1180px] items-center gap-4 px-4 sm:px-6 lg:px-9">
          <a
            href={onHome ? "#top" : "/"}
            className="flex items-center gap-3"
            aria-label={`${name} — retour en haut`}
          >
            <Logo
              name={name}
              logoUrl={logoUrl}
              size={condensed ? 30 : 36}
              tone="light"
            />
            <span className="display text-[15px] font-normal text-cream">
              {name}
            </span>
          </a>

          <nav className="ml-auto hidden items-center gap-7 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.hash}
                href={resolve(l.hash, onHome)}
                aria-current={
                  current === l.hash.slice(1) ? "location" : undefined
                }
                className={`group relative py-1 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-300 hover:text-gold-soft ${
                  current === l.hash.slice(1)
                    ? "text-gold-soft"
                    : "text-cream-dim/75"
                }`}
              >
                {l.label}
                <span
                  className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-gold transition-transform duration-400 group-hover:scale-x-100 ${
                    current === l.hash.slice(1) ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </a>
            ))}
          </nav>

          {telHref && (
            <a
              href={telHref}
              className="ml-auto inline-flex items-center gap-2 border border-gold/45 px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-gold-pale transition-colors duration-300 hover:border-gold hover:bg-gold/10 md:ml-0"
            >
              <Phone size={13} strokeWidth={2} />
              <span className="hidden sm:inline">{phone}</span>
              <span className="sm:hidden">Appeler</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            className="p-2 text-cream transition-colors hover:text-gold-soft md:hidden"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="no-print fixed inset-0 z-[60] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className="absolute inset-0 bg-wood-deep/80 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.nav
              className="wood-deep absolute inset-y-0 right-0 flex w-[min(20rem,86vw)] flex-col gap-1 border-l border-gold/20 p-6"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Logo name={name} logoUrl={logoUrl} size={30} tone="light" />
                  <span className="display text-sm text-cream">{name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer le menu"
                  className="p-2 text-cream-dim transition-colors hover:text-gold-soft"
                >
                  <X size={20} />
                </button>
              </div>

              {LINKS.map((l, i) => (
                <motion.a
                  key={l.hash}
                  href={resolve(l.hash, onHome)}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.06 }}
                  className="display border-b border-gold/10 py-4 text-lg font-light text-cream transition-colors hover:text-gold-soft"
                >
                  {l.label}
                </motion.a>
              ))}

              {telHref && (
                <a
                  href={telHref}
                  className="mt-auto inline-flex items-center justify-center gap-2 border border-gold/50 px-5 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-gold-pale"
                >
                  <Phone size={14} /> {phone}
                </a>
              )}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
