"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { LogOut, ShieldAlert } from "lucide-react";
import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { Banner, Button, Field, Input, Spinner } from "./ui";
import { Logo } from "@/components/site/Logo";

type AdminContextValue = {
  supabase: SupabaseClient;
  email: string;
  signOut: () => Promise<void>;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin doit être utilisé dans <AdminGate>");
  return ctx;
}

type Status =
  | { kind: "loading" }
  | { kind: "no-config" }
  | { kind: "signed-out" }
  | { kind: "not-admin"; email: string }
  | { kind: "ready"; email: string };

/**
 * Portail de l'administration.
 *
 * Deux vérifications successives, car l'inscription publique est ouverte
 * sur ce projet Supabase :
 *   1. l'utilisateur est-il connecté ?
 *   2. figure-t-il dans la table admin_users ? (fonction is_admin())
 * Les policies RLS appliquent la même règle côté serveur : l'interface
 * n'est qu'un confort, la sécurité est en base.
 */
export function AdminGate({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [status, setStatus] = useState<Status>({ kind: "loading" });

  const evaluate = useCallback(async () => {
    if (!supabase) {
      setStatus({ kind: "no-config" });
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setStatus({ kind: "signed-out" });
      return;
    }

    const email = session.user.email ?? "";
    const { data, error } = await supabase.rpc("is_admin");

    if (error) {
      // La base n'est pas encore initialisée (migration non exécutée).
      setStatus({ kind: "not-admin", email });
      return;
    }

    setStatus(data === true ? { kind: "ready", email } : { kind: "not-admin", email });
  }, [supabase]);

  useEffect(() => {
    void evaluate();
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange(() => void evaluate());
    return () => data.subscription.unsubscribe();
  }, [supabase, evaluate]);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
    setStatus({ kind: "signed-out" });
  }, [supabase]);

  if (status.kind === "loading") {
    return (
      <Centered>
        <Spinner label="Vérification de la session…" />
      </Centered>
    );
  }

  if (status.kind === "no-config") {
    return (
      <Centered>
        <Banner tone="warn">
          <strong className="block">Supabase n&apos;est pas configuré.</strong>
          Renseignez <code>NEXT_PUBLIC_SUPABASE_URL</code> et{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> dans <code>.env.local</code>{" "}
          (en local) ou dans les variables d&apos;environnement Vercel, puis
          rechargez la page.
        </Banner>
      </Centered>
    );
  }

  if (status.kind === "signed-out") {
    return (
      <Centered>
        <LoginForm supabase={supabase!} onDone={evaluate} />
      </Centered>
    );
  }

  if (status.kind === "not-admin") {
    return (
      <Centered>
        <div className="rounded-2xl border border-line bg-surface p-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-amber-50 text-amber-600">
            <ShieldAlert size={22} />
          </span>
          <h1 className="mt-5 font-display text-xl font-semibold text-ink">
            Accès non autorisé
          </h1>
          <p className="mt-2 text-sm text-muted">
            Le compte <strong className="text-ink">{status.email}</strong>{" "}
            n&apos;est pas déclaré comme administrateur.
          </p>
          <div className="mt-5 rounded-xl bg-cream p-4 text-left text-xs text-ink-2">
            <p className="mb-2 font-semibold">Pour l&apos;autoriser :</p>
            <p className="mb-2">
              Supabase → SQL Editor → exécutez (après avoir lancé la migration{" "}
              <code>0001_init.sql</code>) :
            </p>
            <pre className="overflow-x-auto rounded-lg bg-walnut-deep p-3 text-[11px] leading-relaxed text-sand">
{`insert into public.admin_users (user_id, email)
select id, email from auth.users
where email = '${status.email}'
on conflict (user_id) do nothing;`}
            </pre>
          </div>
          <Button variant="ghost" className="mt-5" onClick={signOut}>
            <LogOut size={15} /> Se déconnecter
          </Button>
        </div>
      </Centered>
    );
  }

  return (
    <AdminContext.Provider value={{ supabase: supabase!, email: status.email, signOut }}>
      {children}
    </AdminContext.Provider>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-cream px-4 py-16">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

function LoginForm({
  supabase,
  onDone,
}: {
  supabase: SupabaseClient;
  onDone: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "E-mail ou mot de passe incorrect."
          : error.message === "Email not confirmed"
            ? "Ce compte n'est pas confirmé. Dans Supabase → Authentication → Users, ouvrez le compte et confirmez-le."
            : error.message,
      );
      return;
    }

    onDone();
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-line bg-surface p-8 shadow-[0_24px_60px_-44px_rgba(32,25,20,0.8)]"
    >
      <div className="flex flex-col items-center text-center">
        <Logo name="Roxford" size={52} />
        <h1 className="mt-5 font-display text-2xl font-semibold text-ink">
          Espace propriétaire
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Connectez-vous pour modifier le site.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <Field label="Adresse e-mail">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="vous@exemple.com"
          />
        </Field>

        <Field label="Mot de passe">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </Field>

        {error && <Banner tone="error">{error}</Banner>}

        <Button type="submit" loading={loading} className="w-full py-3">
          Se connecter
        </Button>
      </div>

      <Link
        href="/"
        className="mt-6 block text-center text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
      >
        ← Retour au site
      </Link>
    </form>
  );
}
