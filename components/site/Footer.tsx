import { Facebook, Instagram, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Logo } from "./Logo";
import type { SiteSettings } from "@/lib/types";

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  const telHref = settings.phone
    ? `tel:${settings.phone.replace(/\s+/g, "")}`
    : null;

  return (
    <footer className="relative overflow-hidden bg-walnut-deep pb-10 pt-16 text-sand">
      {/* Ligne d'eau : deux vagues décalées, en mouvement lent */}
      <div
        aria-hidden
        className="no-print pointer-events-none absolute inset-x-0 top-0 h-14 overflow-hidden opacity-25"
      >
        <svg
          className="animate-drift h-full w-[200%]"
          viewBox="0 0 1200 56"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0 34 C 150 6, 300 62, 450 34 S 750 6, 900 34 S 1200 62, 1350 34 V56 H0Z"
            fill="#b08d57"
            opacity="0.5"
          />
          <path
            d="M0 42 C 180 18, 320 66, 520 42 S 820 18, 1020 42 S 1320 66, 1500 42 V56 H0Z"
            fill="#2e7d7b"
          />
        </svg>
      </div>

      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-9">
        <div className="grid gap-10 border-b border-sand/15 pb-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <Logo
                name={settings.restaurant_name}
                logoUrl={settings.logo_url}
                size={44}
                tone="light"
              />
              <div>
                <p className="font-display text-2xl font-semibold text-cream">
                  {settings.restaurant_name}
                </p>
                <p className="text-sm text-sand/60">{settings.tagline}</p>
              </div>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-sand/70">
              {settings.description}
            </p>
          </div>

          <div>
            <h3 className="eyebrow text-brass-soft">Contact</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {telHref && (
                <li>
                  <a
                    href={telHref}
                    className="inline-flex items-center gap-2.5 text-sand/80 transition-colors hover:text-cream"
                  >
                    <Phone size={15} className="text-brass" />
                    {settings.phone}
                  </a>
                </li>
              )}
              {(settings.address || settings.city) && (
                <li className="flex items-start gap-2.5 text-sand/80">
                  <MapPin size={15} className="mt-1 shrink-0 text-brass" />
                  <span>
                    {settings.address}
                    {settings.address && settings.city && <br />}
                    {settings.city}
                  </span>
                </li>
              )}
            </ul>

            {(settings.facebook_url || settings.instagram_url) && (
              <div className="mt-6 flex gap-2.5">
                {settings.facebook_url && (
                  <a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Facebook"
                    className="grid h-10 w-10 place-items-center rounded-full border border-sand/20 text-sand/75 transition-all hover:border-brass hover:bg-brass/15 hover:text-cream"
                  >
                    <Facebook size={17} />
                  </a>
                )}
                {settings.instagram_url && (
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Instagram"
                    className="grid h-10 w-10 place-items-center rounded-full border border-sand/20 text-sand/75 transition-all hover:border-brass hover:bg-brass/15 hover:text-cream"
                  >
                    <Instagram size={17} />
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="eyebrow text-brass-soft">Le site</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                ["#maison", "La maison"],
                ["#carte", "La carte"],
                ["#galerie", "Galerie"],
                ["#visite", "Nous trouver"],
              ].map(([href, label]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-sand/80 underline-offset-4 transition-colors hover:text-cream hover:underline"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-8 text-xs text-sand/50 sm:flex-row">
          <p>
            © {year} {settings.restaurant_name}. Tous droits réservés.
          </p>
          <Link
            href="/admin"
            className="underline-offset-4 transition-colors hover:text-sand hover:underline"
          >
            Espace propriétaire
          </Link>
        </div>
      </div>
    </footer>
  );
}
