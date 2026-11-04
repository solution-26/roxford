import type { Category, GalleryImage, Product, SiteSettings } from "./types";

/**
 * Contenu de repli, identique au seed SQL (supabase/migrations/0001_init.sql).
 *
 * Il sert dans deux cas :
 *  1. les variables Supabase ne sont pas encore renseignées ;
 *  2. la base est joignable mais encore vide.
 *
 * ⚠️ Menu PROVISOIRE : la page Facebook de Roxford est protégée par un mur
 * de connexion, les plats et prix réels n'ont pas pu être récupérés. Les
 * tarifs respectent la fourchette 10–20 DT annoncée et sont tous modifiables
 * depuis /admin.
 */

export const seedSettings: SiteSettings = {
  id: 1,
  restaurant_name: "Roxford",
  tagline: "Restaurant · Fast Food & More",
  description:
    "Au cœur de Nabeul, Roxford vous accueille dans une salle à l'esprit marin — boiseries chaudes, hublots de laiton et aquariums — pour une cuisine généreuse servie du midi jusque tard le soir.",
  logo_url: null,
  hero_image_url: "/photos/salle-3.png",
  phone: "53 288 222",
  address: "CPV8+V57",
  city: "Nabeul",
  maps_url: "https://www.google.com/maps/search/?api=1&query=Roxford+Nabeul",
  facebook_url: "https://www.facebook.com/RoxfordNabeul/",
  instagram_url: null,
  price_range: "10–20 DT",
  currency: "DT",
  hours: [
    { day: "Lundi", open: "11:00", close: "23:00", closed: false },
    { day: "Mardi", open: "11:00", close: "23:00", closed: false },
    { day: "Mercredi", open: "11:00", close: "23:00", closed: false },
    { day: "Jeudi", open: "11:00", close: "23:00", closed: false },
    { day: "Vendredi", open: "11:00", close: "23:00", closed: false },
    { day: "Samedi", open: "11:00", close: "23:00", closed: false },
    { day: "Dimanche", open: "11:00", close: "23:00", closed: false },
  ],
  features: [
    "Terrasse",
    "Salle climatisée",
    "Sur place & à emporter",
    "Familles bienvenues",
  ],
  accent_color: "#2E7D7B",
};

type SeedCategory = Omit<Category, "id"> & { id: string };

export const seedCategories: SeedCategory[] = [
  { id: "entrees", slug: "entrees", name: "Entrées & Salades", description: "Pour commencer en fraîcheur", icon: "salad", sort_order: 10, is_active: true },
  { id: "sandwichs", slug: "sandwichs", name: "Sandwichs", description: "Préparés minute, pain frais du jour", icon: "sandwich", sort_order: 20, is_active: true },
  { id: "burgers", slug: "burgers", name: "Burgers", description: "Steak haché maison et sauces signature", icon: "burger", sort_order: 30, is_active: true },
  { id: "tacos", slug: "tacos", name: "Tacos", description: "Généreux, gratinés, à composer", icon: "wrap", sort_order: 40, is_active: true },
  { id: "pizzas", slug: "pizzas", name: "Pizzas", description: "Pâte fine, cuisson au four", icon: "pizza", sort_order: 50, is_active: true },
  { id: "pates", slug: "pates", name: "Pâtes & Plats", description: "Les classiques de la maison", icon: "pasta", sort_order: 60, is_active: true },
  { id: "desserts", slug: "desserts", name: "Desserts", description: "La touche sucrée", icon: "dessert", sort_order: 70, is_active: true },
  { id: "boissons", slug: "boissons", name: "Boissons", description: "Fraîches et chaudes", icon: "drink", sort_order: 80, is_active: true },
];

const raw: Array<
  [string, string, string, number, boolean, number]
> = [
  ["entrees", "Salade César", "Laitue croquante, poulet grillé, copeaux de parmesan, sauce César", 11, false, 10],
  ["entrees", "Salade Niçoise", "Thon, œuf, olives, tomate, pommes de terre", 10.5, false, 20],
  ["entrees", "Salade Roxford", "Crevettes, avocat, agrumes et vinaigrette maison", 14, true, 30],
  ["entrees", "Chorba", "Soupe traditionnelle du jour", 5, false, 40],
  ["entrees", "Bricks à l'œuf", "Feuille de brick croustillante, thon, câpres", 4.5, false, 50],

  ["sandwichs", "Sandwich Thon", "Thon, harissa, olives, œuf, salade méchouia", 8, false, 10],
  ["sandwichs", "Sandwich Escalope", "Escalope de poulet panée, crudités, sauce au choix", 9.5, false, 20],
  ["sandwichs", "Sandwich Viande Hachée", "Viande hachée épicée, fromage fondu, frites", 11, false, 30],
  ["sandwichs", "Chapati Poulet", "Pain chapati moelleux, poulet mariné, sauce fromagère", 10, true, 40],
  ["sandwichs", "Makloub Mixte", "Poulet et viande, fromage, légumes grillés", 12.5, false, 50],

  ["burgers", "Classic Burger", "Steak haché, cheddar, salade, tomate, oignon, sauce burger", 12, false, 10],
  ["burgers", "Double Cheese", "Deux steaks, double cheddar, cornichons", 16, true, 20],
  ["burgers", "Chicken Crispy", "Poulet croustillant, coleslaw, sauce épicée", 13, false, 30],
  ["burgers", "Roxford Signature", "Steak, bacon de dinde, cheddar, oignons confits, sauce maison", 18, true, 40],
  ["burgers", "Veggie Burger", "Galette de légumes, fromage, roquette", 11, false, 50],

  ["tacos", "Tacos 1 Viande", "Viande au choix, frites, sauce fromagère, gratiné", 11, false, 10],
  ["tacos", "Tacos 2 Viandes", "Deux viandes au choix, frites, sauce fromagère", 14, true, 20],
  ["tacos", "Tacos 3 Viandes", "Trio de viandes pour les grandes faims", 17, false, 30],
  ["tacos", "Tacos Crevettes", "Crevettes sautées, sauce algérienne, gratiné", 16, false, 40],

  ["pizzas", "Margherita", "Sauce tomate, mozzarella, basilic", 9, false, 10],
  ["pizzas", "Quatre Fromages", "Mozzarella, gorgonzola, chèvre, parmesan", 14, false, 20],
  ["pizzas", "Thon & Câpres", "Sauce tomate, thon, oignons, olives, câpres", 13, false, 30],
  ["pizzas", "Fruits de Mer", "Crevettes, calamars, moules, ail et persil", 18, true, 40],
  ["pizzas", "Pizza Roxford", "Viande hachée, merguez, poivrons, œuf", 16, false, 50],

  ["pates", "Spaghetti Bolognaise", "Sauce bolognaise mijotée, parmesan", 12, false, 10],
  ["pates", "Penne Quatre Fromages", "Crème de fromages, poivre noir", 13, false, 20],
  ["pates", "Linguine Fruits de Mer", "Crevettes, calamars, tomates cerises, ail", 19, true, 30],
  ["pates", "Escalope Milanaise", "Escalope panée, spaghetti, sauce tomate", 15, false, 40],
  ["pates", "Grillade Mixte", "Côtelettes, merguez, escalope, frites et salade", 20, false, 50],

  ["desserts", "Tiramisu", "Mascarpone, café, cacao", 6.5, false, 10],
  ["desserts", "Fondant au Chocolat", "Cœur coulant, glace vanille", 7, true, 20],
  ["desserts", "Crème Brûlée", "Vanille de Madagascar, caramel croquant", 6.5, false, 30],
  ["desserts", "Salade de Fruits", "Fruits frais de saison", 5.5, false, 40],

  ["boissons", "Eau Minérale 50cl", "Plate ou gazeuse", 1.5, false, 10],
  ["boissons", "Soda", "Coca-Cola, Fanta, Sprite, Boga", 3, false, 20],
  ["boissons", "Jus Pressé", "Orange, citronnade ou fraise selon saison", 6, true, 30],
  ["boissons", "Café Express", "Torréfaction maison", 2.5, false, 40],
  ["boissons", "Thé aux Pignons", "Thé à la menthe et pignons de pin", 4, false, 50],
];

export const seedProducts: Product[] = raw.map(
  ([category_id, name, description, price, is_featured, sort_order], i) => ({
    id: `seed-${i}`,
    category_id,
    name,
    description,
    price,
    price_variants: [],
    image_url: null,
    tags: [],
    is_available: true,
    is_featured,
    sort_order,
  }),
);

export const seedGallery: GalleryImage[] = [
  { id: "g1", url: "/photos/salle-1.png", caption: "La salle et ses hublots de bois", sort_order: 10 },
  { id: "g2", url: "/photos/salle-2.png", caption: "Boiseries, laiton et lustres de papier", sort_order: 20 },
  { id: "g3", url: "/photos/salle-3.png", caption: "Les banquettes face aux aquariums", sort_order: 30 },
  { id: "g4", url: "/photos/vitrine-marine.png", caption: "La vitrine d'objets marins", sort_order: 40 },
];
