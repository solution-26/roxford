"use client";

import { Check, Plus, Save, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/auth";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  Banner,
  Button,
  Card,
  Field,
  Input,
  Spinner,
  Textarea,
  Toggle,
} from "@/components/admin/ui";
import { DAY_ORDER } from "@/lib/hours";
import { seedSettings } from "@/lib/seed";
import type { DayHours, SiteSettings } from "@/lib/types";

export default function SettingsPage() {
  const { supabase } = useAdmin();
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<
    { tone: "ok" | "error" | "warn"; text: string } | null
  >(null);
  const [newFeature, setNewFeature] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      setMessage({
        tone: "error",
        text: `Lecture impossible : ${error.message}. La migration 0001_init.sql a-t-elle été exécutée ?`,
      });
      setForm({ ...seedSettings });
    } else if (!data) {
      setMessage({
        tone: "warn",
        text: "Aucun paramètre enregistré pour l'instant. Les valeurs ci-dessous sont des propositions — enregistrez pour les adopter.",
      });
      setForm({ ...seedSettings });
    } else {
      setForm({
        ...(data as SiteSettings),
        hours: Array.isArray(data.hours) ? data.hours : [],
        features: Array.isArray(data.features) ? data.features : [],
      });
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  function patch(changes: Partial<SiteSettings>) {
    setForm((f) => (f ? { ...f, ...changes } : f));
    setMessage(null);
  }

  function patchDay(day: string, changes: Partial<DayHours>) {
    setForm((f) => {
      if (!f) return f;
      const exists = f.hours.some(
        (h) => h.day.toLowerCase() === day.toLowerCase(),
      );
      const hours = exists
        ? f.hours.map((h) =>
            h.day.toLowerCase() === day.toLowerCase() ? { ...h, ...changes } : h,
          )
        : [
            ...f.hours,
            { day, open: "11:00", close: "23:00", closed: false, ...changes },
          ];
      return { ...f, hours };
    });
    setMessage(null);
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    setMessage(null);

    // On réordonne les horaires Lundi → Dimanche avant d'enregistrer.
    const hours = DAY_ORDER.map(
      (day) =>
        form.hours.find((h) => h.day.toLowerCase() === day.toLowerCase()) ?? {
          day,
          open: "11:00",
          close: "23:00",
          closed: true,
        },
    );

    const { error } = await supabase.from("site_settings").upsert(
      {
        id: 1,
        restaurant_name: form.restaurant_name,
        tagline: form.tagline,
        description: form.description,
        logo_url: form.logo_url,
        hero_image_url: form.hero_image_url,
        phone: form.phone,
        address: form.address,
        city: form.city,
        maps_url: form.maps_url,
        facebook_url: form.facebook_url,
        instagram_url: form.instagram_url,
        price_range: form.price_range,
        currency: form.currency,
        hours,
        features: form.features,
        accent_color: form.accent_color,
      },
      { onConflict: "id" },
    );

    setSaving(false);

    if (error) {
      setMessage({ tone: "error", text: `Enregistrement refusé : ${error.message}` });
      return;
    }

    setForm((f) => (f ? { ...f, hours } : f));
    setMessage({
      tone: "ok",
      text: "Modifications enregistrées. Le site public se met à jour en moins d'une minute.",
    });
  }

  if (loading || !form) return <Spinner label="Chargement des paramètres…" />;

  return (
    <div className="space-y-6 pb-28">
      {message && <Banner tone={message.tone}>{message.text}</Banner>}

      {/* ---------------- Identité ---------------- */}
      <Card
        title="Identité"
        description="Le nom et le logo apparaissent dans l'en-tête, le pied de page et l'onglet du navigateur."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nom de l'établissement">
            <Input
              value={form.restaurant_name}
              onChange={(e) => patch({ restaurant_name: e.target.value })}
            />
          </Field>

          <Field label="Accroche" hint="Affichée sous le nom, ex. « Restaurant & Fast Food »">
            <Input
              value={form.tagline}
              onChange={(e) => patch({ tagline: e.target.value })}
            />
          </Field>

          <Field label="Présentation" className="sm:col-span-2">
            <Textarea
              value={form.description ?? ""}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </Field>

          <ImageUploader
            supabase={supabase}
            folder="logo"
            label="Logo"
            hint="Carré, idéalement 512×512. Sans logo, un monogramme est dessiné automatiquement."
            value={form.logo_url}
            onChange={(url) => patch({ logo_url: url })}
          />

          <ImageUploader
            supabase={supabase}
            folder="hero"
            label="Photo d'accueil"
            hint="Format paysage. C'est la grande image en haut du site."
            aspect="wide"
            value={form.hero_image_url}
            onChange={(url) => patch({ hero_image_url: url })}
          />
        </div>
      </Card>

      {/* ---------------- Contact ---------------- */}
      <Card title="Coordonnées">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Téléphone">
            <Input
              value={form.phone ?? ""}
              onChange={(e) => patch({ phone: e.target.value })}
              placeholder="53 288 222"
            />
          </Field>

          <Field label="Ville">
            <Input
              value={form.city ?? ""}
              onChange={(e) => patch({ city: e.target.value })}
              placeholder="Nabeul"
            />
          </Field>

          <Field label="Adresse" className="sm:col-span-2">
            <Input
              value={form.address ?? ""}
              onChange={(e) => patch({ address: e.target.value })}
              placeholder="CPV8+V57"
            />
          </Field>

          <Field label="Lien Google Maps" className="sm:col-span-2">
            <Input
              type="url"
              value={form.maps_url ?? ""}
              onChange={(e) => patch({ maps_url: e.target.value })}
              placeholder="https://maps.app.goo.gl/…"
            />
          </Field>

          <Field label="Page Facebook">
            <Input
              type="url"
              value={form.facebook_url ?? ""}
              onChange={(e) => patch({ facebook_url: e.target.value })}
              placeholder="https://www.facebook.com/…"
            />
          </Field>

          <Field label="Compte Instagram">
            <Input
              type="url"
              value={form.instagram_url ?? ""}
              onChange={(e) => patch({ instagram_url: e.target.value })}
              placeholder="https://www.instagram.com/…"
            />
          </Field>

          <Field label="Budget par personne">
            <Input
              value={form.price_range ?? ""}
              onChange={(e) => patch({ price_range: e.target.value })}
              placeholder="10–20 DT"
            />
          </Field>

          <Field label="Devise" hint="Affichée après chaque prix de la carte.">
            <Input
              value={form.currency}
              onChange={(e) => patch({ currency: e.target.value })}
              placeholder="DT"
            />
          </Field>
        </div>
      </Card>

      {/* ---------------- Horaires ---------------- */}
      <Card
        title="Horaires"
        description="Le bandeau « Ouvert / Fermé » du site se calcule automatiquement à partir de ces horaires, à l'heure de Nabeul."
      >
        <div className="divide-y divide-line-soft">
          {DAY_ORDER.map((day) => {
            const entry = form.hours.find(
              (h) => h.day.toLowerCase() === day.toLowerCase(),
            );
            const closed = entry?.closed ?? false;

            return (
              <div
                key={day}
                className="flex flex-wrap items-center gap-4 py-3.5"
              >
                <span className="w-28 shrink-0 text-sm font-semibold text-ink">
                  {day}
                </span>

                <Toggle
                  checked={!closed}
                  onChange={(open) => patchDay(day, { closed: !open })}
                  label={closed ? "Fermé" : "Ouvert"}
                />

                {!closed && (
                  <div className="ml-auto flex items-center gap-2">
                    <Input
                      type="time"
                      value={entry?.open ?? "11:00"}
                      onChange={(e) => patchDay(day, { open: e.target.value })}
                      className="w-32"
                    />
                    <span className="text-muted">→</span>
                    <Input
                      type="time"
                      value={entry?.close ?? "23:00"}
                      onChange={(e) => patchDay(day, { close: e.target.value })}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted">
          Un service qui se termine après minuit est géré : indiquez par exemple
          11:00 → 01:00.
        </p>
      </Card>

      {/* ---------------- Services ---------------- */}
      <Card
        title="Services proposés"
        description="Ces mentions apparaissent sur la page d'accueil (terrasse, à emporter…)."
      >
        <ul className="flex flex-wrap gap-2">
          {form.features.map((feature) => (
            <li
              key={feature}
              className="inline-flex items-center gap-2 rounded-full bg-sand px-3.5 py-2 text-sm font-medium text-walnut"
            >
              {feature}
              <button
                type="button"
                aria-label={`Retirer ${feature}`}
                onClick={() =>
                  patch({ features: form.features.filter((f) => f !== feature) })
                }
                className="rounded-full p-0.5 text-walnut/60 transition-colors hover:bg-walnut/15 hover:text-walnut"
              >
                <X size={14} />
              </button>
            </li>
          ))}
          {form.features.length === 0 && (
            <li className="text-sm text-muted">Aucun service renseigné.</li>
          )}
        </ul>

        <form
          className="mt-5 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const value = newFeature.trim();
            if (!value || form.features.includes(value)) return;
            patch({ features: [...form.features, value] });
            setNewFeature("");
          }}
        >
          <Input
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            placeholder="Ex. Terrasse, Wifi gratuit, Parking…"
            className="max-w-sm"
          />
          <Button type="submit" variant="ghost">
            <Plus size={15} /> Ajouter
          </Button>
        </form>
      </Card>

      {/* ---------------- Barre d'enregistrement ---------------- */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3.5 sm:px-6">
          <p className="hidden text-sm text-muted sm:block">
            Les changements sont visibles sur le site public en moins
            d&apos;une minute.
          </p>
          {message?.tone === "ok" && (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
              <Check size={16} /> Enregistré
            </span>
          )}
          <Button onClick={save} loading={saving} className="ml-auto px-6 py-3">
            <Save size={16} /> Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}
