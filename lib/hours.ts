import type { DayHours } from "./types";

const TZ = "Africa/Tunis";

/** Lundi = 0 … Dimanche = 6, pour s'aligner sur l'ordre d'affichage français. */
const ORDER = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

type Now = { dayIndex: number; minutes: number };

/** Heure courante à Nabeul, indépendamment du fuseau du visiteur. */
function nowInTunis(date = new Date()): Now {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const weekday = get("weekday");
  const map: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };

  return {
    dayIndex: map[weekday] ?? 0,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

function toMinutes(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

export type OpenState = {
  isOpen: boolean;
  /** Phrase prête à afficher, ex. « Ouvert · ferme à 23:00 ». */
  label: string;
  todayIndex: number;
};

export function getOpenState(hours: DayHours[], date = new Date()): OpenState {
  const { dayIndex, minutes } = nowInTunis(date);

  const byDay = (i: number) =>
    hours.find((h) => h.day.toLowerCase() === ORDER[i].toLowerCase());

  const today = byDay(dayIndex);

  if (!today || today.closed) {
    // On cherche le prochain jour ouvert pour rester informatif.
    for (let step = 1; step <= 7; step += 1) {
      const next = byDay((dayIndex + step) % 7);
      if (next && !next.closed) {
        const when = step === 1 ? "demain" : next.day.toLowerCase();
        return {
          isOpen: false,
          label: `Fermé · ouvre ${when} à ${next.open}`,
          todayIndex: dayIndex,
        };
      }
    }
    return { isOpen: false, label: "Fermé", todayIndex: dayIndex };
  }

  const open = toMinutes(today.open);
  const close = toMinutes(today.close);
  if (open === null || close === null) {
    return { isOpen: false, label: "Horaires à confirmer", todayIndex: dayIndex };
  }

  // Un service qui se termine après minuit (ex. 11:00 → 01:00).
  const overnight = close <= open;
  const isOpen = overnight
    ? minutes >= open || minutes < close
    : minutes >= open && minutes < close;

  if (isOpen) {
    // Minutes restantes, en tenant compte d'un service qui passe minuit.
    const remaining = overnight && minutes >= open
      ? close + 24 * 60 - minutes
      : close - minutes;

    // Dans la dernière heure, le compte à rebours est plus utile que
    // l'heure de fermeture : il évite à quelqu'un de se déplacer pour rien.
    if (remaining <= 60) {
      return {
        isOpen: true,
        label:
          remaining <= 1
            ? "Ouvert · ferme dans un instant"
            : `Ouvert · ferme dans ${remaining} min`,
        todayIndex: dayIndex,
      };
    }

    return {
      isOpen: true,
      label: `Ouvert · ferme à ${today.close}`,
      todayIndex: dayIndex,
    };
  }

  if (minutes < open) {
    return {
      isOpen: false,
      label: `Fermé · ouvre à ${today.open}`,
      todayIndex: dayIndex,
    };
  }

  const tomorrow = byDay((dayIndex + 1) % 7);
  return {
    isOpen: false,
    label: tomorrow && !tomorrow.closed
      ? `Fermé · ouvre demain à ${tomorrow.open}`
      : "Fermé",
    todayIndex: dayIndex,
  };
}

export const DAY_ORDER = ORDER;

/** « 12.5 » → « 12,500 » (format tunisien : 3 décimales, virgule). */
export function formatAmount(value: number): string {
  const n = Number.isFinite(value) ? value : 0;
  return n.toFixed(3).replace(".", ",");
}

/** « 12.5 » → « 12,500 DT ». */
export function formatPrice(value: number, currency = "DT"): string {
  return `${formatAmount(value)} ${currency}`;
}
