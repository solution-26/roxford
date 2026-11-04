import "server-only";

import {
  seedCategories,
  seedGallery,
  seedProducts,
  seedSettings,
} from "./seed";
import { createPublicClient } from "./supabase/public";
import type {
  Category,
  GalleryImage,
  Product,
  SiteContent,
  SiteSettings,
} from "./types";

const fallback: SiteContent = {
  settings: seedSettings,
  categories: seedCategories,
  products: seedProducts,
  gallery: seedGallery,
  live: false,
};

/**
 * Charge le contenu du site.
 *
 * Trois niveaux de robustesse, pour qu'une page publique ne soit jamais en
 * erreur :
 *   1. Supabase non configuré  → contenu local de démonstration ;
 *   2. Supabase injoignable ou en erreur → contenu local ;
 *   3. Supabase OK mais table vide → contenu local pour cette table.
 */
export async function getSiteContent(): Promise<SiteContent> {
  const supabase = createPublicClient();
  if (!supabase) return fallback;

  try {
    const [settingsRes, categoriesRes, productsRes, galleryRes] =
      await Promise.all([
        supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
        supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("products")
          .select("*")
          .order("sort_order", { ascending: true }),
        supabase
          .from("gallery_images")
          .select("*")
          .order("sort_order", { ascending: true }),
      ]);

    const firstError =
      settingsRes.error ??
      categoriesRes.error ??
      productsRes.error ??
      galleryRes.error;

    if (firstError) {
      console.warn("[roxford] lecture Supabase impossible :", firstError.message);
      return fallback;
    }

    const settings = (settingsRes.data as SiteSettings | null) ?? seedSettings;
    const categories = (categoriesRes.data as Category[] | null) ?? [];
    const products = (productsRes.data as Product[] | null) ?? [];
    const gallery = (galleryRes.data as GalleryImage[] | null) ?? [];

    return {
      settings: {
        ...settings,
        hours: Array.isArray(settings.hours) ? settings.hours : [],
        features: Array.isArray(settings.features) ? settings.features : [],
      },
      categories: categories.length ? categories : seedCategories,
      products: products.length
        ? products.map((p) => ({
            ...p,
            price: Number(p.price),
            price_variants: Array.isArray(p.price_variants)
              ? p.price_variants.map((v) => ({
                  label: String(v?.label ?? ""),
                  price: Number(v?.price ?? 0),
                }))
              : [],
          }))
        : categories.length
          ? []
          : seedProducts,
      gallery: gallery.length ? gallery : seedGallery,
      live: true,
    };
  } catch (error) {
    console.warn("[roxford] Supabase injoignable :", error);
    return fallback;
  }
}
