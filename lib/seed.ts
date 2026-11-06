import type { Category, GalleryImage, Product, SiteSettings } from "./types";

/**
 * Contenu de repli, identique au seed SQL
 * (supabase/migrations/0001_init.sql + 0003_menu_reel.sql).
 *
 * Il sert dans deux cas :
 *  1. les variables Supabase ne sont pas renseignées ;
 *  2. la base est joignable mais encore vide.
 *
 * CARTE RÉELLE, relevée sur le panneau-menu du restaurant.
 * Aucune description n'est inventée : le panneau n'en porte pas, les plats
 * s'affichent donc en nom + prix, comme sur la carte imprimée. Le
 * propriétaire peut en ajouter depuis /admin.
 *
 * Six prix restent incertains (photo en 460×614, chiffres à la limite de
 * lisibilité) — ils sont marqués « ⚠ à vérifier » dans 0003_menu_reel.sql.
 */

export const seedSettings: SiteSettings = {
  id: 1,
  restaurant_name: "Roxford",
  tagline: "Restaurant · Fast Food & More",
  description:
    "Au cœur de Nabeul, Roxford fait du fromage sa signature : pizzas gratinées, sandwichs fondants et gratins généreux, servis dans une salle à l'esprit marin — boiseries chaudes, hublots de laiton et aquariums.",
  logo_url: null,
  hero_image_url: "/photos/salle-3.webp",
  phone: "53 288 222",
  address: "CPV8+V57",
  city: "Nabeul",
  maps_url: "https://www.google.com/maps/search/?api=1&query=Roxford+Nabeul",
  facebook_url: "https://www.facebook.com/RoxfordNabeul/",
  instagram_url: null,
  price_range: "10–20 DT",
  currency: "DT",
  hours: [
    { day: "Lundi", open: "10:00", close: "23:00", closed: false },
    { day: "Mardi", open: "10:00", close: "23:00", closed: false },
    { day: "Mercredi", open: "10:00", close: "23:00", closed: false },
    { day: "Jeudi", open: "10:00", close: "23:00", closed: false },
    { day: "Vendredi", open: "10:00", close: "23:00", closed: false },
    { day: "Samedi", open: "10:00", close: "23:00", closed: false },
    { day: "Dimanche", open: "10:00", close: "23:00", closed: false },
  ],
  features: [
    "Terrasse",
    "Salle climatisée",
    "Sur place & à emporter",
    "Familles bienvenues",
  ],
  accent_color: "#2E7D7B",
};

export const seedCategories: Category[] = [
  { id: "sand-maqloub", slug: "sand-maqloub", name: "Sand. Ma9loub", description: "Grillé et garni minute", icon: "sandwich", sort_order: 10, is_active: true },
  { id: "pain-cornet", slug: "pain-cornet", name: "Pain Cornet", description: "Le classique de la maison", icon: "sandwich", sort_order: 20, is_active: true },
  { id: "baguette-farcie", slug: "baguette-farcie", name: "Baguette Farcie", description: "Pain frais, garniture généreuse", icon: "sandwich", sort_order: 30, is_active: true },
  { id: "sand-roxford", slug: "sand-roxford", name: "Sand. Roxford", description: "Nos créations maison", icon: "burger", sort_order: 40, is_active: true },
  { id: "pizzas", slug: "pizzas", name: "Pizzas", description: "Pâte fine, gratinées au four", icon: "pizza", sort_order: 50, is_active: true },
  { id: "plats", slug: "plats", name: "Plats", description: "Pâtes, poissons et salades", icon: "pasta", sort_order: 60, is_active: true },
];

/** [catégorie, nom, prix, en vedette] — pour les plats à prix unique. */
const simple: Array<[string, string, number, boolean]> = [
  // ----- Sand. Ma9loub -----
  ["sand-maqloub", "Jambon", 4.2, false],
  ["sand-maqloub", "Thon", 4.2, false],
  ["sand-maqloub", "Escalope grillée", 4.8, false],
  ["sand-maqloub", "Escalope panée", 5.0, false],
  ["sand-maqloub", "Viande hachée", 5.5, false],

  // ----- Pain Cornet -----
  ["pain-cornet", "Jambon", 4.2, false],
  ["pain-cornet", "Thon", 4.5, false],
  ["pain-cornet", "Escalope grillée", 5.0, false],
  ["pain-cornet", "Escalope panée", 5.2, false],
  ["pain-cornet", "Viande hachée", 5.8, false],

  // ----- Baguette Farcie -----
  ["baguette-farcie", "Jambon", 4.5, false],
  ["baguette-farcie", "Thon", 4.8, false],
  ["baguette-farcie", "Escalope grillée", 5.5, false],
  ["baguette-farcie", "Escalope panée", 5.8, false],
  ["baguette-farcie", "Viande hachée", 6.0, false],

  // ----- Sand. Roxford (Home Made) -----
  ["sand-roxford", "Le Charcutier", 4.5, false],
  ["sand-roxford", "The Buffalo Chicken", 5.0, false],
  ["sand-roxford", "Kentucky Fried", 5.2, false],
  ["sand-roxford", "Meat Lovers", 5.5, true],
  ["sand-roxford", "Cordon Bleu", 5.5, true],
  ["sand-roxford", "The Bold", 6.5, true],

  // ----- Plats -----
  ["plats", "Escalope grillée ou panée", 9.5, false],
  ["plats", "Escalope sauce aux champignons", 12.0, false],
  ["plats", "Émincé de volaille au curry", 12.5, false],
  ["plats", "Complet Poisson", 15.0, false],
  ["plats", "Calamar doré", 12.0, false],
  ["plats", "Spaghetti bolognaise", 9.5, false],
  ["plats", "Puttanesca", 8.5, false],
  ["plats", "Tagliatelle au saumon", 16.0, false],
  ["plats", "Gratin de Fruits de mer", 15.0, true],
  ["plats", "Lasagnes", 9.0, true],
  ["plats", "Ojja Merguez", 8.0, false],
  ["plats", "Ojja Fruits de mer", 9.0, false],
  ["plats", "Salade César", 6.5, false],
  ["plats", "Salade Roxford", 7.5, false],
  ["plats", "Salade Méchouiya", 4.0, false],
];

/** [nom, prix L, prix XL, en vedette] — les pizzas sont servies en deux tailles. */
const pizzas: Array<[string, number, number, boolean]> = [
  ["Margherita", 6.5, 9.5, false],
  ["Neptune", 7.4, 12.0, false],
  ["Quatre Fromages", 9.8, 14.5, true],
  ["Végétarienne", 7.5, 11.0, false],
  ["Quatre Saisons", 8.2, 12.5, false],
  ["Bolonaise", 8.5, 12.0, false],
  ["Regina", 7.5, 11.0, false],
  ["Roxford", 10.8, 18.5, true],
  ["Fruits de Mer", 13.0, 16.0, true],
];

export const seedProducts: Product[] = [
  ...simple.map(([category_id, name, price, is_featured], i) => ({
    id: `seed-${i}`,
    category_id,
    name,
    description: null,
    price,
    price_variants: [],
    image_url: null,
    tags: [],
    is_available: true,
    is_featured,
    sort_order: (i + 1) * 10,
  })),
  ...pizzas.map(([name, large, xlarge, is_featured], i) => ({
    id: `seed-pizza-${i}`,
    category_id: "pizzas",
    name,
    description: null,
    price: large,
    price_variants: [
      { label: "L", price: large },
      { label: "XL", price: xlarge },
    ],
    image_url: null,
    tags: [],
    is_available: true,
    is_featured,
    sort_order: (i + 1) * 10,
  })),
];

export const seedGallery: GalleryImage[] = [
  { id: "g1", url: "/photos/salle-1.webp", caption: "La salle et ses hublots de bois", sort_order: 10 },
  { id: "g2", url: "/photos/salle-2.webp", caption: "Boiseries, laiton et lustres de papier", sort_order: 20 },
  { id: "g3", url: "/photos/salle-3.webp", caption: "Les banquettes face aux aquariums", sort_order: 30 },
  { id: "g4", url: "/photos/vitrine-marine.webp", caption: "La vitrine d'objets marins", sort_order: 40 },
];
