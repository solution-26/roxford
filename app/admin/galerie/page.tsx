"use client";

import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import Image from "next/image";
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
} from "@/components/admin/ui";
import { revalidatePublicPages } from "@/lib/revalidate";
import type { GalleryImage } from "@/lib/types";

export default function GalleryAdminPage() {
  const { supabase } = useAdmin();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<
    { tone: "ok" | "error"; text: string } | null
  >(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [pendingCaption, setPendingCaption] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("sort_order");

    if (error) {
      setMessage({
        tone: "error",
        text: `Lecture impossible : ${error.message}. La migration 0001_init.sql a-t-elle été exécutée ?`,
      });
    } else {
      setImages((data ?? []) as GalleryImage[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  // PromiseLike : les requêtes Supabase sont « thenables », pas des Promise.
  async function run(
    action: () => PromiseLike<{ error: { message: string } | null }>,
    ok: string,
  ) {
    const { error } = await action();
    if (error) {
      setMessage({ tone: "error", text: error.message });
      return;
    }
    setMessage({ tone: "ok", text: ok });
    await Promise.all([load(), revalidatePublicPages(supabase)]);
  }

  async function add() {
    if (!pendingUrl) return;
    await run(
      () =>
        supabase.from("gallery_images").insert({
          url: pendingUrl,
          caption: pendingCaption.trim() || null,
          sort_order: (images.length + 1) * 10,
        }),
      "Photo ajoutée à la galerie.",
    );
    setPendingUrl(null);
    setPendingCaption("");
  }

  async function remove(image: GalleryImage) {
    if (!window.confirm("Retirer cette photo de la galerie ?")) return;
    await run(
      () => supabase.from("gallery_images").delete().eq("id", image.id),
      "Photo retirée.",
    );
  }

  async function move(image: GalleryImage, delta: number) {
    const index = images.findIndex((i) => i.id === image.id);
    const target = images[index + delta];
    if (!target) return;

    await run(async () => {
      const a = await supabase
        .from("gallery_images")
        .update({ sort_order: target.sort_order })
        .eq("id", image.id);
      if (a.error) return a;
      return supabase
        .from("gallery_images")
        .update({ sort_order: image.sort_order })
        .eq("id", target.id);
    }, "Ordre mis à jour.");
  }

  async function updateCaption(image: GalleryImage, caption: string) {
    await run(
      () =>
        supabase
          .from("gallery_images")
          .update({ caption: caption.trim() || null })
          .eq("id", image.id),
      "Légende enregistrée.",
    );
  }

  if (loading) return <Spinner label="Chargement de la galerie…" />;

  return (
    <div className="space-y-6">
      {message && <Banner tone={message.tone}>{message.text}</Banner>}

      <Card
        title="Ajouter une photo"
        description="La première photo de la liste occupe le grand cadre sur le site."
      >
        <div className="space-y-5">
          <ImageUploader
            supabase={supabase}
            folder="galerie"
            label="Photo"
            aspect="wide"
            value={pendingUrl}
            onChange={setPendingUrl}
          />

          <Field label="Légende" hint="Facultative, affichée au survol de la photo.">
            <Input
              value={pendingCaption}
              onChange={(e) => setPendingCaption(e.target.value)}
              placeholder="La salle et ses hublots de bois"
              className="max-w-md"
            />
          </Field>

          <Button onClick={add} disabled={!pendingUrl}>
            Ajouter à la galerie
          </Button>
        </div>
      </Card>

      <Card title={`Photos publiées (${images.length})`}>
        {images.length === 0 ? (
          <p className="text-sm text-muted">
            La galerie est vide. Ajoutez une première photo ci-dessus.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {images.map((image, i) => (
              <li
                key={image.id}
                className="flex gap-4 rounded-xl border border-line bg-cream p-3"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={image.url}
                    alt={image.caption ?? ""}
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized={image.url.startsWith("http")}
                  />
                  {i === 0 && (
                    <span className="absolute inset-x-0 bottom-0 bg-walnut/85 py-0.5 text-center text-[10px] font-semibold uppercase tracking-wide text-cream">
                      Mise en avant
                    </span>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Input
                    defaultValue={image.caption ?? ""}
                    onBlur={(e) => {
                      if (e.target.value !== (image.caption ?? "")) {
                        void updateCaption(image, e.target.value);
                      }
                    }}
                    placeholder="Légende"
                  />

                  <div className="mt-auto flex gap-1.5">
                    <IconBtn
                      label="Vers la gauche"
                      disabled={i === 0}
                      onClick={() => move(image, -1)}
                    >
                      <ChevronLeft size={15} />
                    </IconBtn>
                    <IconBtn
                      label="Vers la droite"
                      disabled={i === images.length - 1}
                      onClick={() => move(image, 1)}
                    >
                      <ChevronRight size={15} />
                    </IconBtn>
                    <IconBtn label="Supprimer" danger onClick={() => remove(image)}>
                      <Trash2 size={14} />
                    </IconBtn>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  danger,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border p-2 transition-colors disabled:opacity-35 ${
        danger
          ? "border-red-200 text-red-600 hover:bg-red-50"
          : "border-line text-ink-2 hover:bg-surface"
      }`}
    >
      {children}
    </button>
  );
}
