import { Facebook, Instagram } from "lucide-react";
import Link from "next/link";
import { Logo } from "./Logo";
import type { SiteSettings } from "@/lib/types";

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  const telHref = settings.phone
    ? `tel:${settings.phone.replace(/\s+/g, "")}`
    : null;

  return (
    <footer className="wood-deep relative overflow-hidden border-t border-gold/20 pb-9 pt-16">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-9">
        <div className="grid gap-12 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* — Signature — */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <Logo
                name={settings.restaurant_name}
                logoUrl={settings.logo_url}
                size={40}
                tone="light"
              />
              <div>
                <p className="display text-2xl font-light text-cream">
                  {settings.restaurant_name}.
                </p>
                <p className="eyebrow mt-1 text-gold/80">
                  {settings.city ?? "Nabeul"}
                </p>
              </div>
            </div>
            <p className="mt-7 max-w-sm text-[13px] leading-relaxed text-cream-dim/60">
              {settings.description}
            </p>
          </div>

          {/* — Adresse — */}
          <div>
            <h3 className="eyebrow text-gold">Adresse</h3>
            <p className="mt-5 text-[14px] leading-relaxed text-cream-dim/75">
              {settings.address}
              {settings.address && settings.city && <br />}
              {settings.city}
            </p>
            {settings.maps_url && (
              <a
                href={settings.maps_url}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-3 inline-block text-[11px] uppercase tracking-[0.14em] text-gold-soft underline-offset-4 hover:underline"
              >
                Voir le plan
              </a>
            )}
          </div>

          {/* — Contact — */}
          <div>
            <h3 className="eyebrow text-gold">Contact</h3>
            {telHref && (
              <a
                href={telHref}
                className="mt-5 block font-display text-xl font-light tracking-wide text-cream transition-colors hover:text-gold-soft"
              >
                {settings.phone}
              </a>
            )}

            <ul className="mt-6 space-y-2.5 text-[13px]">
              {[
                ["/carte", "La carte"],
                ["/#galerie", "La salle"],
                ["/#visite", "Nous trouver"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-cream-dim/65 underline-offset-4 transition-colors hover:text-cream hover:underline"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {(settings.facebook_url || settings.instagram_url) && (
              <div className="mt-6 flex gap-2">
                {settings.facebook_url && (
                  <a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Facebook"
                    className="grid h-9 w-9 place-items-center border border-gold/25 text-cream-dim/70 transition-colors hover:border-gold hover:text-gold-soft"
                  >
                    <Facebook size={15} />
                  </a>
                )}
                {settings.instagram_url && (
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Instagram"
                    className="grid h-9 w-9 place-items-center border border-gold/25 text-cream-dim/70 transition-colors hover:border-gold hover:text-gold-soft"
                  >
                    <Instagram size={15} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-gold/15 pt-7 text-[11px] uppercase tracking-[0.14em] text-muted sm:flex-row">
          <p>
            © {year} {settings.restaurant_name}
          </p>
          <Link
            href="/admin"
            className="underline-offset-4 transition-colors hover:text-cream-dim hover:underline"
          >
            Espace propriétaire
          </Link>
        </div>
      </div>
    </footer>
  );
}
