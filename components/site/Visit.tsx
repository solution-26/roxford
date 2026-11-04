import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import { DAY_ORDER } from "@/lib/hours";
import { Reveal } from "./Reveal";
import type { SiteSettings } from "@/lib/types";

export function Visit({
  settings,
  todayIndex,
  isOpen,
  openLabel,
}: {
  settings: SiteSettings;
  todayIndex: number;
  isOpen: boolean;
  openLabel: string;
}) {
  const telHref = settings.phone
    ? `tel:${settings.phone.replace(/\s+/g, "")}`
    : null;

  // On réordonne pour toujours afficher Lundi → Dimanche.
  const rows = DAY_ORDER.map((day) => ({
    day,
    entry: settings.hours.find(
      (h) => h.day.toLowerCase() === day.toLowerCase(),
    ),
  }));

  const fullAddress = [settings.address, settings.city]
    .filter(Boolean)
    .join(", ");

  return (
    <section
      id="visite"
      className="grain relative overflow-hidden bg-cream py-20 sm:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-9">
        <div className="mb-14 text-center">
          <Reveal>
            <p className="eyebrow text-brass">Nous trouver</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mx-auto mt-5 max-w-xl font-display text-[clamp(2.2rem,5.5vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink">
              On vous attend à {settings.city ?? "Nabeul"}
            </h2>
          </Reveal>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.15fr]">
          {/* — Horaires — */}
          <Reveal direction="right">
            <div className="rounded-[22px] border border-line bg-surface p-7 shadow-[0_24px_60px_-42px_rgba(32,25,20,0.7)] sm:p-9">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-aqua/10 text-aqua">
                  <Clock size={19} strokeWidth={2.1} />
                </span>
                <h3 className="font-display text-xl font-semibold text-ink">
                  Horaires
                </h3>
                <span
                  className={`ml-auto inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-semibold ${
                    isOpen
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-sand text-walnut"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isOpen ? "bg-emerald-500" : "bg-brass"
                    }`}
                  />
                  {isOpen ? "Ouvert" : "Fermé"}
                </span>
              </div>

              <p className="mt-3 text-sm text-muted">{openLabel}</p>

              <dl className="mt-7 divide-y divide-line-soft">
                {rows.map(({ day, entry }, i) => {
                  const today = i === todayIndex;
                  return (
                    <div
                      key={day}
                      className={`flex items-center justify-between py-2.5 text-[15px] ${
                        today ? "font-semibold text-ink" : "text-ink-2"
                      }`}
                    >
                      <dt className="flex items-center gap-2">
                        {today && (
                          <span
                            aria-hidden
                            className="h-1.5 w-1.5 rounded-full bg-aqua"
                          />
                        )}
                        <span className={today ? "" : "pl-3.5"}>{day}</span>
                        {today && (
                          <span className="rounded-full bg-aqua/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-aqua">
                            Aujourd&apos;hui
                          </span>
                        )}
                      </dt>
                      <dd className="tabular-nums">
                        {!entry || entry.closed ? (
                          <span className="text-muted">Fermé</span>
                        ) : (
                          `${entry.open} – ${entry.close}`
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </Reveal>

          {/* — Adresse, contact, carte — */}
          <Reveal direction="left" delay={0.12}>
            <div className="flex h-full flex-col gap-6">
              <div className="rounded-[22px] border border-line bg-surface p-7 shadow-[0_24px_60px_-42px_rgba(32,25,20,0.7)] sm:p-9">
                <div className="grid gap-7 sm:grid-cols-2">
                  <div>
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-aqua/10 text-aqua">
                      <MapPin size={19} strokeWidth={2.1} />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-semibold text-ink">
                      Adresse
                    </h3>
                    <p className="mt-1.5 text-ink-2">{fullAddress || "—"}</p>
                    {settings.maps_url && (
                      <a
                        href={settings.maps_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-aqua underline-offset-4 hover:underline"
                      >
                        <Navigation size={14} />
                        Ouvrir l&apos;itinéraire
                      </a>
                    )}
                  </div>

                  <div>
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-aqua/10 text-aqua">
                      <Phone size={19} strokeWidth={2.1} />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-semibold text-ink">
                      Réserver, commander
                    </h3>
                    {telHref ? (
                      <>
                        <a
                          href={telHref}
                          className="mt-1.5 block font-display text-2xl font-semibold tracking-tight text-walnut transition-colors hover:text-aqua"
                        >
                          {settings.phone}
                        </a>
                        <p className="mt-1.5 text-sm text-muted">
                          Sur place ou à emporter
                        </p>
                      </>
                    ) : (
                      <p className="mt-1.5 text-ink-2">—</p>
                    )}
                  </div>
                </div>

                {settings.price_range && (
                  <p className="mt-8 border-t border-line-soft pt-5 text-sm text-muted">
                    Budget moyen&nbsp;:{" "}
                    <span className="font-semibold text-ink">
                      {settings.price_range}
                    </span>{" "}
                    par personne
                  </p>
                )}
              </div>

              {/* Plan interactif, sans clé d'API */}
              <div className="no-print relative min-h-[16rem] flex-1 overflow-hidden rounded-[22px] border border-line bg-sand shadow-[0_24px_60px_-42px_rgba(32,25,20,0.7)]">
                <iframe
                  title={`Plan — ${settings.restaurant_name}`}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=10.70%2C36.44%2C10.78%2C36.48&layer=mapnik&marker=36.4561%2C10.7376`}
                  className="h-full w-full border-0 grayscale-[0.25]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
