"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { GalleryImage } from "@/lib/types";

const ease = [0.2, 0, 0, 1] as const;

export function Gallery({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const reduced = useReducedMotion();

  const close = useCallback(() => setIndex(null), []);
  const go = useCallback(
    (delta: number) =>
      setIndex((current) =>
        current === null
          ? null
          : (current + delta + images.length) % images.length,
      ),
    [images.length],
  );

  // Navigation au clavier + blocage du défilement derrière la visionneuse.
  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [index, close, go]);

  if (images.length === 0) return null;

  // Avec 5 photos ou plus, la première occupe un grand carré (mosaïque).
  // En dessous, une grille régulière évite les cases vides.
  const mosaic = images.length >= 5;

  return (
    <section
      id="galerie"
      className="relative overflow-hidden bg-night py-20 sm:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-9">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <motion.p
              className="eyebrow text-brass"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Galerie
            </motion.p>
            <motion.h2
              className="mt-5 font-display text-[clamp(2.2rem,5.5vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-cream"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.08, ease }}
            >
              L&apos;ambiance du lieu
            </motion.h2>
          </div>
          <p className="max-w-xs text-sm text-sand/60">
            Cliquez sur une photo pour l&apos;agrandir.
          </p>
        </div>

        <div
          className={`grid grid-cols-2 gap-3 sm:gap-4 ${
            mosaic ? "lg:grid-cols-4" : ""
          }`}
        >
          {images.map((image, i) => (
            <motion.button
              key={image.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`group relative overflow-hidden rounded-2xl ring-1 ring-cream/10 transition-all duration-500 hover:ring-brass/60 ${
                mosaic && i === 0
                  ? "col-span-2 row-span-2 aspect-square"
                  : mosaic
                    ? "aspect-[4/5]"
                    : "aspect-[4/3]"
              }`}
              initial={reduced ? false : { opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease }}
            >
              <Image
                src={image.url}
                alt={image.caption ?? "Photo du restaurant"}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-[900ms] group-hover:scale-[1.07]"
                unoptimized={image.url.startsWith("http")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
              {image.caption && (
                <span className="absolute inset-x-0 bottom-0 translate-y-1 p-4 text-left text-sm font-medium text-cream opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  {image.caption}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* — Visionneuse — */}
      <AnimatePresence>
        {index !== null && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-night/95 p-4 backdrop-blur-sm sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="Photo en grand"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Fermer"
              className="absolute right-4 top-4 rounded-full border border-cream/20 p-3 text-cream/80 transition-colors hover:bg-cream/10 hover:text-cream sm:right-7 sm:top-7"
            >
              <X size={22} />
            </button>

            {images.length > 1 && (
              <>
                <NavButton side="left" onClick={() => go(-1)} />
                <NavButton side="right" onClick={() => go(1)} />
              </>
            )}

            <motion.figure
              key={images[index].id}
              className="relative max-h-full w-full max-w-4xl"
              initial={reduced ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
                <Image
                  src={images[index].url}
                  alt={images[index].caption ?? "Photo du restaurant"}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  unoptimized={images[index].url.startsWith("http")}
                />
              </div>
              {images[index].caption && (
                <figcaption className="mt-4 text-center text-sm text-sand/75">
                  {images[index].caption}
                </figcaption>
              )}
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function NavButton({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Photo précédente" : "Photo suivante"}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`absolute top-1/2 z-10 -translate-y-1/2 rounded-full border border-cream/20 bg-night/50 p-3 text-cream/80 backdrop-blur transition-colors hover:bg-cream/15 hover:text-cream ${
        side === "left" ? "left-3 sm:left-7" : "right-3 sm:right-7"
      }`}
    >
      <Icon size={24} />
    </button>
  );
}
