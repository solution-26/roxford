"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Phone } from "lucide-react";
import { useState } from "react";

/**
 * Bouton d'appel flottant, mobile uniquement.
 *
 * Sur un site de restaurant, appeler est l'action principale ; or le
 * numéro de l'en-tête disparaît dès qu'on descend. Ce bouton apparaît
 * une fois le héros passé et suit le visiteur jusqu'en bas.
 *
 * Il est masqué à partir de md : sur grand écran le numéro reste
 * visible dans l'en-tête condensé.
 */
export function CallFab({ phone }: { phone: string | null }) {
  const [visible, setVisible] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    setVisible(y > window.innerHeight * 0.7);
  });

  if (!phone) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={`tel:${phone.replace(/\s+/g, "")}`}
          aria-label={`Appeler le ${phone}`}
          className="no-print fixed bottom-5 right-4 z-40 inline-flex items-center gap-2.5 rounded-full bg-gold px-5 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-wood-deep shadow-[0_12px_32px_-10px_rgba(0,0,0,0.7)] md:hidden"
          style={{ paddingBottom: "max(0.875rem, env(safe-area-inset-bottom))" }}
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
        >
          <Phone size={15} strokeWidth={2.4} />
          Appeler
        </motion.a>
      )}
    </AnimatePresence>
  );
}
