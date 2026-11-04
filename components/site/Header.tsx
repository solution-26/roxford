"use client";

import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "motion/react";
import { Menu, Phone, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";

const LINKS = [
  { hash: "#maison", label: "La maison" },
  { hash: "#carte", label: "La carte" },
  { hash: "#galerie", label: "Galerie" },
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

  const telHref = phone ? `tel:${phone.replace(/\s+/g, "")}` : null;

  return (
    <>
      <header
        className={`no-print fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          condensed
            ? "border-b border-line/70 bg-cream/90 py-2 shadow-[0_8px_30px_-18px_rgba(32,25,20,0.5)] backdrop-blur-xl"
            : "border-b border-transparent py-4"
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
              size={condensed ? 34 : 42}
              tone={condensed ? "dark" : "light"}
            />
            <span
              className={`font-display text-xl font-semibold tracking-tight transition-colors duration-500 ${
                condensed ? "text-ink" : "text-cream"
              }`}
            >
              {name}
            </span>
          </a>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.hash}
                href={resolve(l.hash, onHome)}
                className={`group relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                  condensed
                    ? "text-ink-2 hover:text-walnut"
                    : "text-cream/85 hover:text-cream"
                }`}
              >
                {l.label}
                <span className="absolute inset-x-4 -bottom-px h-px origin-left scale-x-0 bg-brass transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          {telHref && (
            <a
              href={telHref}
              className={`ml-auto inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300 md:ml-2 ${
                condensed
                  ? "bg-walnut text-cream hover:bg-walnut-deep"
                  : "bg-cream/15 text-cream ring-1 ring-cream/35 backdrop-blur-md hover:bg-cream/25"
              }`}
            >
              <Phone size={15} strokeWidth={2.4} />
              <span className="hidden sm:inline">{phone}</span>
              <span className="sm:hidden">Appeler</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            className={`rounded-full p-2.5 transition-colors md:hidden ${
              condensed
                ? "text-ink hover:bg-sand"
                : "text-cream hover:bg-cream/15"
            }`}
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
              className="absolute inset-0 bg-night/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.nav
              className="absolute inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col gap-2 bg-cream p-6 shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Logo name={name} logoUrl={logoUrl} size={34} />
                  <span className="font-display text-lg font-semibold">
                    {name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer le menu"
                  className="rounded-full p-2 text-ink-2 hover:bg-sand"
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
                  className="rounded-xl px-4 py-3.5 font-display text-xl text-ink transition-colors hover:bg-sand"
                >
                  {l.label}
                </motion.a>
              ))}

              {telHref && (
                <a
                  href={telHref}
                  className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-walnut px-5 py-3.5 font-semibold text-cream"
                >
                  <Phone size={16} /> {phone}
                </a>
              )}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
