"use client";

import { useEffect, useState } from "react";
import { getOpenState } from "@/lib/hours";
import type { DayHours } from "@/lib/types";

/**
 * État d'ouverture, recalculé dans le navigateur.
 *
 * Les pages publiques sont mises en cache (revalidate = 60, et Vercel
 * peut servir plus vieux encore) : un « ferme dans 45 min » rendu côté
 * serveur se figerait. On part donc de la valeur du serveur — ce qui
 * évite toute divergence à l'hydratation — puis on recalcule au montage
 * et toutes les trente secondes.
 */
export function useOpenState(
  hours: DayHours[],
  initial: { isOpen: boolean; label: string },
) {
  const [state, setState] = useState(initial);

  useEffect(() => {
    const tick = () => {
      const { isOpen, label } = getOpenState(hours);
      setState((previous) =>
        previous.isOpen === isOpen && previous.label === label
          ? previous
          : { isOpen, label },
      );
    };

    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [hours]);

  return state;
}

/** Pastille « Ouvert · ferme dans 45 min », à jour en continu. */
export function OpenBadge({
  hours,
  initialIsOpen,
  initialLabel,
  className,
}: {
  hours: DayHours[];
  initialIsOpen: boolean;
  initialLabel: string;
  className?: string;
}) {
  const { isOpen, label } = useOpenState(hours, {
    isOpen: initialIsOpen,
    label: initialLabel,
  });

  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <span className="relative flex h-1.5 w-1.5">
        {isOpen && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cheese opacity-70" />
        )}
        <span
          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
            isOpen ? "bg-cheese" : "bg-muted"
          }`}
        />
      </span>
      {label}
    </span>
  );
}
