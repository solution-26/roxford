"use client";

import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
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
  Textarea,
  Toggle,
} from "@/components/admin/ui";
import { formatAmount, formatPrice } from "@/lib/hours";
import type { Category, PriceVariant, Product } from "@/lib/types";

type Message = { tone: "ok" | "error"; text: string } | null;

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || `cat-${Date.now()}`;

export default function MenuAdminPage() {
  const { supabase } = useAdmin();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<Message>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<Partial<Category> | null>(null);

  const load = useCallback(async () => {
    const [cats, prods] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("products").select("*").order("sort_order"),
    ]);

    if (cats.error || prods.error) {
      setMessage({
        tone: "error",
        text: `Lecture impossible : ${(cats.error ?? prods.error)!.message}. La migration 0001_init.sql a-t-elle été exécutée ?`,
      });
      setLoading(false);
      return;
    }

    const list = (cats.data ?? []) as Category[];
    setCategories(list);
    setProducts(
      ((prods.data ?? []) as Product[]).map((p) => ({
        ...p,
        price: Number(p.price),
        price_variants: Array.isArray(p.price_variants)
          ? p.price_variants.map((v) => ({
              label: String(v?.label ?? ""),
              price: Number(v?.price ?? 0),
            }))
          : [],
      })),
    );
    setSelected((s) => s ?? list[0]?.id ?? null);
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
      return false;
    }
    setMessage({ tone: "ok", text: ok });
    await load();
    return true;
  }

  /* ------------------------- Catégories ------------------------- */

  async function saveCategory(draft: Partial<Category>) {
    const name = (draft.name ?? "").trim();
    if (!name) return;

    const payload = {
      name,
      slug: draft.slug?.trim() || slugify(name),
      description: draft.description || null,
      sort_order: Number(draft.sort_order ?? (categories.length + 1) * 10),
      is_active: draft.is_active ?? true,
    };

    const done = await run(
      () =>
        draft.id
          ? supabase.from("categories").update(payload).eq("id", draft.id)
          : supabase.from("categories").insert(payload),
      draft.id ? "Catégorie modifiée." : "Catégorie ajoutée.",
    );

    if (done) setEditingCategory(null);
  }

  async function deleteCategory(category: Category) {
    const count = products.filter((p) => p.category_id === category.id).length;
    const warning = count
      ? `Supprimer « ${category.name} » ainsi que ses ${count} plat(s) ?`
      : `Supprimer la catégorie « ${category.name} » ?`;
    if (!window.confirm(warning)) return;

    await run(
      () => supabase.from("categories").delete().eq("id", category.id),
      "Catégorie supprimée.",
    );
    setSelected((s) => (s === category.id ? null : s));
  }

  async function moveCategory(category: Category, delta: number) {
    const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order);
    const index = sorted.findIndex((c) => c.id === category.id);
    const target = sorted[index + delta];
    if (!target) return;

    await run(async () => {
      const a = await supabase
        .from("categories")
        .update({ sort_order: target.sort_order })
        .eq("id", category.id);
      if (a.error) return a;
      return supabase
        .from("categories")
        .update({ sort_order: category.sort_order })
        .eq("id", target.id);
    }, "Ordre mis à jour.");
  }

  /* --------------------------- Produits --------------------------- */

  async function saveProduct(draft: Partial<Product>) {
    const name = (draft.name ?? "").trim();
    if (!name || !draft.category_id) return;

    const siblings = products.filter((p) => p.category_id === draft.category_id);

    // On ne garde que les tailles réellement nommées.
    const variants = (draft.price_variants ?? [])
      .map((v) => ({ label: v.label.trim(), price: Number(v.price) || 0 }))
      .filter((v) => v.label.length > 0);

    const payload = {
      category_id: draft.category_id,
      name,
      description: draft.description || null,
      price: Number(draft.price ?? 0),
      price_variants: variants,
      image_url: draft.image_url || null,
      tags: draft.tags ?? [],
      is_available: draft.is_available ?? true,
      is_featured: draft.is_featured ?? false,
      sort_order: Number(draft.sort_order ?? (siblings.length + 1) * 10),
    };

    const done = await run(
      () =>
        draft.id
          ? supabase.from("products").update(payload).eq("id", draft.id)
          : supabase.from("products").insert(payload),
      draft.id ? "Plat modifié." : "Plat ajouté.",
    );

    if (done) setEditing(null);
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Supprimer « ${product.name} » ?`)) return;
    await run(
      () => supabase.from("products").delete().eq("id", product.id),
      "Plat supprimé.",
    );
  }

  async function toggleAvailable(product: Product) {
    await run(
      () =>
        supabase
          .from("products")
          .update({ is_available: !product.is_available })
          .eq("id", product.id),
      product.is_available ? "Plat masqué du site." : "Plat remis en ligne.",
    );
  }

  if (loading) return <Spinner label="Chargement de la carte…" />;

  const current = categories.find((c) => c.id === selected) ?? null;
  const items = products
    .filter((p) => p.category_id === selected)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-6">
      {message && <Banner tone={message.tone}>{message.text}</Banner>}

      {/* ---------------- Catégories ---------------- */}
      <Card
        title="Catégories"
        description="L'ordre ci-dessous est celui de la carte sur le site."
        actions={
          <Button
            variant="ghost"
            onClick={() =>
              setEditingCategory({
                name: "",
                sort_order: (categories.length + 1) * 10,
                is_active: true,
              })
            }
          >
            <Plus size={15} /> Nouvelle catégorie
          </Button>
        }
      >
        {categories.length === 0 ? (
          <p className="text-sm text-muted">
            Aucune catégorie. Commencez par en créer une (ex. « Burgers »).
          </p>
        ) : (
          <ul className="space-y-2">
            {[...categories]
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((category, i, all) => {
                const count = products.filter(
                  (p) => p.category_id === category.id,
                ).length;
                const active = category.id === selected;

                return (
                  <li
                    key={category.id}
                    className={`flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors ${
                      active
                        ? "border-aqua/50 bg-aqua/8"
                        : "border-line bg-cream"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelected(category.id)}
                      className="mr-auto flex min-w-0 items-baseline gap-2.5 text-left"
                    >
                      <span className="font-display text-base font-semibold text-ink">
                        {category.name}
                      </span>
                      <span className="text-xs text-muted">
                        {count} plat{count > 1 ? "s" : ""}
                      </span>
                      {!category.is_active && (
                        <span className="rounded-full bg-sand px-2 py-0.5 text-[10px] font-semibold uppercase text-walnut">
                          Masquée
                        </span>
                      )}
                    </button>

                    <IconBtn
                      label="Monter"
                      disabled={i === 0}
                      onClick={() => moveCategory(category, -1)}
                    >
                      <ChevronUp size={15} />
                    </IconBtn>
                    <IconBtn
                      label="Descendre"
                      disabled={i === all.length - 1}
                      onClick={() => moveCategory(category, 1)}
                    >
                      <ChevronDown size={15} />
                    </IconBtn>
                    <IconBtn
                      label="Modifier"
                      onClick={() => setEditingCategory(category)}
                    >
                      <Pencil size={14} />
                    </IconBtn>
                    <IconBtn
                      label="Supprimer"
                      danger
                      onClick={() => deleteCategory(category)}
                    >
                      <Trash2 size={14} />
                    </IconBtn>
                  </li>
                );
              })}
          </ul>
        )}
      </Card>

      {/* ---------------- Plats ---------------- */}
      {current && (
        <Card
          title={`Plats — ${current.name}`}
          description="Masquer un plat le retire du site sans le supprimer (utile pour une rupture)."
          actions={
            <Button
              onClick={() =>
                setEditing({
                  category_id: current.id,
                  name: "",
                  price: 0,
                  is_available: true,
                  is_featured: false,
                  tags: [],
                  sort_order: (items.length + 1) * 10,
                })
              }
            >
              <Plus size={15} /> Ajouter un plat
            </Button>
          }
        >
          {items.length === 0 ? (
            <p className="text-sm text-muted">
              Aucun plat dans cette catégorie.
            </p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={`flex flex-wrap items-center gap-3 py-3 ${
                    item.is_available ? "" : "opacity-55"
                  }`}
                >
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-line bg-cream">
                    {item.image_url && (
                      <Image
                        src={item.image_url}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                        unoptimized
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-semibold text-ink">
                      {item.name}
                      {item.is_featured && (
                        <Star
                          size={13}
                          className="text-brass"
                          fill="currentColor"
                          strokeWidth={0}
                        />
                      )}
                    </p>
                    {item.description && (
                      <p className="truncate text-sm text-muted">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 font-display font-semibold tabular-nums text-aqua">
                    {item.price_variants.length > 0
                      ? item.price_variants
                          .map((v) => `${v.label} ${formatAmount(v.price)}`)
                          .join("  ·  ")
                      : formatPrice(item.price)}
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleAvailable(item)}
                    className="shrink-0 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-ink-2 transition-colors hover:bg-cream"
                  >
                    {item.is_available ? "Masquer" : "Afficher"}
                  </button>

                  <IconBtn label="Modifier" onClick={() => setEditing(item)}>
                    <Pencil size={14} />
                  </IconBtn>
                  <IconBtn
                    label="Supprimer"
                    danger
                    onClick={() => deleteProduct(item)}
                  >
                    <Trash2 size={14} />
                  </IconBtn>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* ---------------- Fenêtres d'édition ---------------- */}
      {editingCategory && (
        <Modal
          title={editingCategory.id ? "Modifier la catégorie" : "Nouvelle catégorie"}
          onClose={() => setEditingCategory(null)}
          onSubmit={() => saveCategory(editingCategory)}
        >
          <Field label="Nom">
            <Input
              autoFocus
              value={editingCategory.name ?? ""}
              onChange={(e) =>
                setEditingCategory({ ...editingCategory, name: e.target.value })
              }
              placeholder="Burgers"
            />
          </Field>

          <Field label="Sous-titre" hint="Court, affiché à droite du titre sur le site.">
            <Input
              value={editingCategory.description ?? ""}
              onChange={(e) =>
                setEditingCategory({
                  ...editingCategory,
                  description: e.target.value,
                })
              }
              placeholder="Steak haché maison et sauces signature"
            />
          </Field>

          <Toggle
            checked={editingCategory.is_active ?? true}
            onChange={(v) =>
              setEditingCategory({ ...editingCategory, is_active: v })
            }
            label="Visible sur le site"
          />
        </Modal>
      )}

      {editing && (
        <Modal
          title={editing.id ? "Modifier le plat" : "Nouveau plat"}
          onClose={() => setEditing(null)}
          onSubmit={() => saveProduct(editing)}
        >
          <Field label="Nom du plat">
            <Input
              autoFocus
              value={editing.name ?? ""}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              placeholder="Roxford Signature"
            />
          </Field>

          <Field label="Description">
            <Textarea
              rows={3}
              value={editing.description ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
              placeholder="Steak, cheddar, oignons confits, sauce maison"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prix" hint="En dinars, ex. 12.500">
              <Input
                type="number"
                step="0.100"
                min="0"
                value={editing.price ?? 0}
                onChange={(e) =>
                  setEditing({ ...editing, price: Number(e.target.value) })
                }
              />
            </Field>

            <Field label="Catégorie">
              <select
                value={editing.category_id ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, category_id: e.target.value })
                }
                className="w-full rounded-xl border border-line bg-cream px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-aqua focus:ring-4 focus:ring-aqua/15"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <VariantEditor
            variants={editing.price_variants ?? []}
            onChange={(price_variants) =>
              setEditing({ ...editing, price_variants })
            }
          />

          <ImageUploader
            supabase={supabase}
            folder="plats"
            label="Photo du plat"
            hint="Facultative. Sans photo, le plat s'affiche en style carte imprimée."
            value={editing.image_url ?? null}
            onChange={(url) => setEditing({ ...editing, image_url: url })}
          />

          <div className="flex flex-wrap gap-6 pt-1">
            <Toggle
              checked={editing.is_available ?? true}
              onChange={(v) => setEditing({ ...editing, is_available: v })}
              label="Disponible"
            />
            <Toggle
              checked={editing.is_featured ?? false}
              onChange={(v) => setEditing({ ...editing, is_featured: v })}
              label="Spécialité de la maison"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

/**
 * Tailles multiples (S / L / XL pour les pizzas, Petite / Grande…).
 * Tant que la liste est vide, le plat garde son prix unique.
 */
function VariantEditor({
  variants,
  onChange,
}: {
  variants: PriceVariant[];
  onChange: (variants: PriceVariant[]) => void;
}) {
  const set = (i: number, changes: Partial<PriceVariant>) =>
    onChange(variants.map((v, j) => (i === j ? { ...v, ...changes } : v)));

  return (
    <div className="rounded-xl border border-line bg-cream p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-ink">
          Tailles (facultatif)
        </span>
        <Button
          type="button"
          variant="ghost"
          onClick={() => onChange([...variants, { label: "", price: 0 }])}
        >
          <Plus size={14} /> Ajouter une taille
        </Button>
      </div>

      {variants.length === 0 ? (
        <p className="mt-2 text-xs text-muted">
          Laissez vide pour un prix unique. Ajoutez des tailles pour les
          pizzas&nbsp;: la carte affichera alors une colonne par taille, comme
          le panneau du restaurant.
        </p>
      ) : (
        <>
          <ul className="mt-4 space-y-2">
            {variants.map((variant, i) => (
              <li key={i} className="flex items-center gap-2">
                <Input
                  value={variant.label}
                  onChange={(e) => set(i, { label: e.target.value })}
                  placeholder="S"
                  aria-label={`Nom de la taille ${i + 1}`}
                  className="w-24"
                />
                <Input
                  type="number"
                  step="0.100"
                  min="0"
                  value={variant.price}
                  onChange={(e) => set(i, { price: Number(e.target.value) })}
                  aria-label={`Prix de la taille ${i + 1}`}
                  className="w-32"
                />
                <span className="text-sm text-muted">DT</span>
                <button
                  type="button"
                  aria-label="Retirer cette taille"
                  onClick={() => onChange(variants.filter((_, j) => j !== i))}
                  className="ml-auto rounded-lg border border-red-200 p-2 text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">
            Pour que la carte s&apos;affiche en colonnes, donnez les mêmes
            noms de tailles, dans le même ordre, à tous les plats de la
            catégorie.
          </p>
        </>
      )}
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
      className={`shrink-0 rounded-lg border p-2 transition-colors disabled:opacity-35 ${
        danger
          ? "border-red-200 text-red-600 hover:bg-red-50"
          : "border-line text-ink-2 hover:bg-cream"
      }`}
    >
      {children}
    </button>
  );
}

function Modal({
  title,
  children,
  onClose,
  onSubmit,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-night/60 p-4 backdrop-blur-sm sm:p-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-lg p-2 text-muted transition-colors hover:bg-cream hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">{children}</div>

        <div className="mt-7 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit">Enregistrer</Button>
        </div>
      </form>
    </div>
  );
}
