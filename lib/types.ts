export type DayHours = {
  day: string;
  open: string;
  close: string;
  closed: boolean;
};

export type SiteSettings = {
  id: number;
  restaurant_name: string;
  tagline: string;
  description: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  maps_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  price_range: string | null;
  currency: string;
  hours: DayHours[];
  features: string[];
  accent_color: string;
  updated_at?: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  tags: string[];
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
};

export type GalleryImage = {
  id: string;
  url: string;
  caption: string | null;
  sort_order: number;
};

export type SiteContent = {
  settings: SiteSettings;
  categories: Category[];
  products: Product[];
  gallery: GalleryImage[];
  /** true quand les données viennent de Supabase, false en mode démo local. */
  live: boolean;
};
