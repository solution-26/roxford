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
      className="wood grain relative overflow-hidden py-20 sm:py-28"
    >
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-9">
        <div className="mb-14 text-center">
          <Reveal>
            <p className="eyebrow text-gold">Nous trouver</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="display mx-auto mt-6 max-w-xl text-[clamp(1.9rem,4.6vw,3rem)] font-light text-cream">
              On vous attend à {settings.city ?? "Nabeul"}
            </h2>
          </Reveal>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[1fr_1.1fr]">
          {/* — Horaires — */}
          <Reveal direction="right">
            <div className="border border-gold/20 bg-wood-card/70 p-7 sm:p-9">
              <div className="flex items-center gap-3">
                <Clock size={17} className="text-gold" strokeWidth={1.8} />
                <h3 className="display text-base font-normal text-cream">
                  Horaires
                </h3>
                <span
                  className={`ml-auto inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                    isOpen ? "text-cheese" : "text-muted"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isOpen ? "bg-cheese" : "bg-muted"
                    }`}
                  />
                  {isOpen ? "Ouvert" : "Fermé"}
                </span>
              </div>

              <p className="mt-3 text-[13px] text-muted">{openLabel}</p>

              <dl className="mt-7 divide-y divide-gold/10">
                {rows.map(({ day, entry }, i) => {
                  const today = i === todayIndex;
                  return (
                    <div
                      key={day}
                      className={`flex items-center justify-between py-2.5 text-[14px] ${
                        today ? "text-gold-soft" : "text-cream-dim/75"
                      }`}
                    >
                      <dt className="flex items-center gap-2">
                        {today && (
                          <span
                            aria-hidden
                            className="h-1 w-1 rounded-full bg-gold"
                          />
                        )}
                        <span className={today ? "" : "pl-3"}>{day}</span>
                        {today && (
                          <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gold/70">
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

              {settings.features.length > 0 && (
                <ul className="mt-8 flex flex-wrap gap-2 border-t border-gold/10 pt-6">
                  {settings.features.map((feature) => (
                    <li
                      key={feature}
                      className="border border-gold/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-cream-dim/70"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>

          {/* — Contact et plan — */}
          <Reveal direction="left" delay={0.12}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-7 border border-gold/20 bg-wood-card/70 p-7 sm:grid-cols-2 sm:p-9">
                <div>
                  <MapPin size={17} className="text-gold" strokeWidth={1.8} />
                  <h3 className="display mt-4 text-base font-normal text-cream">
                    Adresse
                  </h3>
                  <p className="mt-2 text-[14px] text-cream-dim/75">
                    {fullAddress || "—"}
                  </p>
                  {settings.maps_url && (
                    <a
                      href={settings.maps_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-gold-soft underline-offset-4 hover:underline"
                    >
                      <Navigation size={12} />
                      Itinéraire
                    </a>
                  )}
                </div>

                <div>
                  <Phone size={17} className="text-gold" strokeWidth={1.8} />
                  <h3 className="display mt-4 text-base font-normal text-cream">
                    Réserver
                  </h3>
                  {telHref ? (
                    <>
                      <a
                        href={telHref}
                        className="mt-2 block font-display text-2xl font-light tracking-wide text-gold-pale transition-colors hover:text-cheese"
                      >
                        {settings.phone}
                      </a>
                      <p className="mt-1.5 text-[13px] text-muted">
                        Sur place ou à emporter
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-cream-dim/75">—</p>
                  )}

                  {settings.price_range && (
                    <p className="mt-5 text-[13px] text-muted">
                      Budget{" "}
                      <span className="text-cream-dim">
                        {settings.price_range}
                      </span>{" "}
                      par personne
                    </p>
                  )}
                </div>
              </div>

              {/* Plan interactif, sans clé d'API.
                  Hauteur explicite : dans une colonne de hauteur
                  automatique, le h-full de l'iframe retombe sinon sur
                  les 150 px par défaut. */}
              <div className="no-print relative h-[21rem] overflow-hidden border border-gold/20 sm:h-[24rem]">
                <iframe
                  title={`Plan — ${settings.restaurant_name}`}
                  src="https://www.openstreetmap.org/export/embed.html?bbox=10.70%2C36.44%2C10.78%2C36.48&layer=mapnik&marker=36.4561%2C10.7376"
                  className="h-full w-full border-0 opacity-85 grayscale-[0.5] contrast-[0.9]"
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
