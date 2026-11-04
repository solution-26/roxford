"use client";

import { ExternalLink, Images, LogOut, Store, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAdmin } from "./auth";
import { Logo } from "@/components/site/Logo";
import { Button } from "./ui";

const NAV = [
  { href: "/admin", label: "Établissement", icon: Store },
  { href: "/admin/carte", label: "La carte", icon: UtensilsCrossed },
  { href: "/admin/galerie", label: "Galerie", icon: Images },
];

export function Shell({ children }: { children: ReactNode }) {
  const { email, signOut } = useAdmin();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Logo name="Roxford" size={34} />
          <div className="mr-auto leading-tight">
            <p className="font-display text-base font-semibold text-ink">
              Administration
            </p>
            <p className="hidden text-xs text-muted sm:block">{email}</p>
          </div>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-sand hover:text-ink"
          >
            <ExternalLink size={15} />
            <span className="hidden sm:inline">Voir le site</span>
          </Link>

          <Button variant="ghost" onClick={signOut}>
            <LogOut size={15} />
            <span className="hidden sm:inline">Quitter</span>
          </Button>
        </div>

        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-walnut text-cream"
                    : "text-ink-2 hover:bg-sand hover:text-ink"
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
