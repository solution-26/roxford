"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Banner } from "./ui";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"];

/** Nom de fichier sûr : pas d'accents ni d'espaces dans la clé de stockage. */
function safeName(name: string) {
  const dot = name.lastIndexOf(".");
  const ext = dot > -1 ? name.slice(dot + 1).toLowerCase() : "jpg";
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

export function ImageUploader({
  supabase,
  folder,
  value,
  onChange,
  label,
  hint,
  aspect = "square",
}: {
  supabase: SupabaseClient;
  folder: string;
  value: string | null;
  onChange: (url: string | null) => void;
  label: string;
  hint?: string;
  aspect?: "square" | "wide";
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(file: File) {
    setError(null);

    if (!ACCEPTED.includes(file.type)) {
      setError("Format non accepté. Utilisez JPG, PNG, WebP, AVIF ou SVG.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(
        `Image trop lourde (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum 5 Mo.`,
      );
      return;
    }

    setBusy(true);
    const path = `${folder}/${safeName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, file, { cacheControl: "31536000", upsert: false });

    if (uploadError) {
      setBusy(false);
      setError(
        uploadError.message.includes("Bucket not found")
          ? "Le bucket « media » n'existe pas encore. Exécutez la migration 0001_init.sql."
          : `Envoi impossible : ${uploadError.message}`,
      );
      return;
    }

    const { data } = supabase.storage.from("media").getPublicUrl(path);
    onChange(data.publicUrl);
    setBusy(false);
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>

      <div className="flex items-start gap-4">
        <div
          className={`relative shrink-0 overflow-hidden rounded-xl border border-line bg-cream ${
            aspect === "square" ? "h-24 w-24" : "h-24 w-40"
          }`}
        >
          {value ? (
            <Image
              src={value}
              alt=""
              fill
              sizes="160px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="grid h-full w-full place-items-center text-muted">
              <ImagePlus size={22} />
            </span>
          )}
          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-cream/80">
              <Loader2 size={20} className="animate-spin text-aqua" />
            </span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={busy}
              className="rounded-xl border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-cream disabled:opacity-55"
            >
              {value ? "Remplacer" : "Choisir une image"}
            </button>

            {value && (
              <button
                type="button"
                onClick={() => onChange(null)}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
              >
                <Trash2 size={14} /> Retirer
              </button>
            )}
          </div>

          <p className="mt-2 text-xs text-muted">
            {hint ?? "JPG, PNG ou WebP — 5 Mo maximum."}
          </p>

          {error && (
            <div className="mt-2">
              <Banner tone="error">{error}</Banner>
            </div>
          )}
        </div>
      </div>

      <input
        ref={input}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handle(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
