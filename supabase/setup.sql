-- ============================================================
--  Roxford — INSTALLATION COMPLETE, EN UN SEUL PASSAGE
--
--  Supabase → SQL Editor → New query → tout coller → Run.
--
--  Regroupe les migrations 0001, 0002 et 0003, puis declare
--  admin@roxford.tn comme administrateur.
--
--  Relancable sans risque SAUF la partie 0003, qui vide et
--  recree la carte : relancer ecrase les modifications faites
--  depuis /admin sur les plats et les categories.
-- ============================================================

-- ==========================================================
--  1/4 — Tables, RLS, stockage, contenu de depart
--  (source : supabase/migrations/0001_init.sql)
-- ==========================================================

-- ============================================================
--  Roxford — Schéma initial
--  Projet Supabase : vtgmcvgcuurpbykovjxl ("restaurants")
--  À exécuter dans : Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ------------------------------------------------------------
-- 1. Extensions
-- ------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 2. Table des administrateurs
--    L'inscription publique est activée sur ce projet Supabase.
--    Être « connecté » ne suffit donc PAS : seuls les comptes
--    listés ici peuvent écrire.
-- ------------------------------------------------------------
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

-- Fonction security definer : évite la récursion infinie de RLS
-- (une policy sur admin_users ne peut pas interroger admin_users).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users au where au.user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ------------------------------------------------------------
-- 3. Paramètres du site (ligne unique, id = 1)
--    Nom, logo, coordonnées, horaires, couleurs : tout est
--    modifiable depuis l'interface d'administration.
-- ------------------------------------------------------------
create table if not exists public.site_settings (
  id              smallint primary key default 1,
  restaurant_name text        not null default 'Roxford',
  tagline         text        not null default 'Restaurant · Fast Food & More',
  description     text,
  logo_url        text,
  hero_image_url  text,
  phone           text,
  address         text,
  city            text,
  maps_url        text,
  facebook_url    text,
  instagram_url   text,
  price_range     text,
  currency        text        not null default 'DT',
  hours           jsonb       not null default '[]'::jsonb,
  features        jsonb       not null default '[]'::jsonb,
  accent_color    text        not null default '#2E7D7B',
  updated_at      timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);

-- ------------------------------------------------------------
-- 4. Catégories du menu
-- ------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text        not null,
  description text,
  icon        text,
  sort_order  integer     not null default 0,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists categories_sort_idx on public.categories (sort_order, name);

-- ------------------------------------------------------------
-- 5. Produits
-- ------------------------------------------------------------
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid references public.categories (id) on delete cascade,
  name         text           not null,
  description  text,
  price        numeric(10, 3) not null default 0,
  image_url    text,
  tags         text[]         not null default '{}',
  is_available boolean        not null default true,
  is_featured  boolean        not null default false,
  sort_order   integer        not null default 0,
  created_at   timestamptz    not null default now(),
  updated_at   timestamptz    not null default now()
);

create index if not exists products_category_idx on public.products (category_id, sort_order);
create index if not exists products_featured_idx on public.products (is_featured) where is_featured;

-- ------------------------------------------------------------
-- 6. Galerie photos
-- ------------------------------------------------------------
create table if not exists public.gallery_images (
  id         uuid primary key default gen_random_uuid(),
  url        text        not null,
  caption    text,
  sort_order integer     not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists gallery_sort_idx on public.gallery_images (sort_order);

-- ------------------------------------------------------------
-- 7. Mise à jour automatique de updated_at
-- ------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists products_touch on public.products;
create trigger products_touch
  before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ============================================================
--  8. Row Level Security
--     Lecture : tout le monde (le site est public).
--     Écriture : uniquement les comptes présents dans admin_users.
-- ============================================================
alter table public.site_settings  enable row level security;
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.gallery_images enable row level security;
alter table public.admin_users    enable row level security;

-- -- site_settings
drop policy if exists site_settings_read  on public.site_settings;
drop policy if exists site_settings_write on public.site_settings;
create policy site_settings_read  on public.site_settings for select using (true);
create policy site_settings_write on public.site_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- -- categories
drop policy if exists categories_read  on public.categories;
drop policy if exists categories_write on public.categories;
create policy categories_read  on public.categories for select using (true);
create policy categories_write on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

-- -- products
drop policy if exists products_read  on public.products;
drop policy if exists products_write on public.products;
create policy products_read  on public.products for select using (true);
create policy products_write on public.products for all
  using (public.is_admin()) with check (public.is_admin());

-- -- gallery_images
drop policy if exists gallery_read  on public.gallery_images;
drop policy if exists gallery_write on public.gallery_images;
create policy gallery_read  on public.gallery_images for select using (true);
create policy gallery_write on public.gallery_images for all
  using (public.is_admin()) with check (public.is_admin());

-- -- admin_users : un admin voit la liste ; personne ne s'auto-ajoute
--    depuis le client (l'ajout se fait ici, en SQL).
drop policy if exists admin_users_read on public.admin_users;
create policy admin_users_read on public.admin_users for select
  using (public.is_admin());

-- ============================================================
--  9. Stockage des images (logo, photos de plats, galerie)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists media_admin_insert on storage.objects;
create policy media_admin_insert on storage.objects for insert
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists media_admin_update on storage.objects;
create policy media_admin_update on storage.objects for update
  using (bucket_id = 'media' and public.is_admin());

drop policy if exists media_admin_delete on storage.objects;
create policy media_admin_delete on storage.objects for delete
  using (bucket_id = 'media' and public.is_admin());

-- ============================================================
--  10. Données initiales
--      ⚠️  Menu PROVISOIRE : tarifs cohérents avec la fourchette
--      10–20 DT annoncée, à corriger depuis /admin par le
--      propriétaire. Les plats réels n'ont pas pu être récupérés
--      (page Facebook protégée par un mur de connexion).
-- ============================================================
insert into public.site_settings (
  id, restaurant_name, tagline, description,
  phone, address, city, maps_url, facebook_url,
  price_range, currency, hours, features, accent_color
) values (
  1,
  'Roxford',
  'Restaurant · Fast Food & More',
  'Au cœur de Nabeul, Roxford vous accueille dans une salle à l''esprit marin — boiseries chaudes, hublots de laiton et aquariums — pour une cuisine généreuse servie du midi jusque tard le soir.',
  '53 288 222',
  'CPV8+V57',
  'Nabeul',
  'https://www.google.com/maps/search/?api=1&query=Roxford+Nabeul',
  'https://www.facebook.com/RoxfordNabeul/',
  '10–20 DT',
  'DT',
  '[
    {"day": "Lundi",    "open": "11:00", "close": "23:00", "closed": false},
    {"day": "Mardi",    "open": "11:00", "close": "23:00", "closed": false},
    {"day": "Mercredi", "open": "11:00", "close": "23:00", "closed": false},
    {"day": "Jeudi",    "open": "11:00", "close": "23:00", "closed": false},
    {"day": "Vendredi", "open": "11:00", "close": "23:00", "closed": false},
    {"day": "Samedi",   "open": "11:00", "close": "23:00", "closed": false},
    {"day": "Dimanche", "open": "11:00", "close": "23:00", "closed": false}
  ]'::jsonb,
  '["Terrasse", "Salle climatisée", "Sur place & à emporter", "Familles bienvenues"]'::jsonb,
  '#2E7D7B'
)
on conflict (id) do nothing;

-- -- Catégories
insert into public.categories (slug, name, description, icon, sort_order) values
  ('entrees',    'Entrées & Salades', 'Pour commencer en fraîcheur',            'salad',   10),
  ('sandwichs',  'Sandwichs',         'Préparés minute, pain frais du jour',    'sandwich', 20),
  ('burgers',    'Burgers',           'Steak haché maison et sauces signature', 'burger',  30),
  ('tacos',      'Tacos',             'Généreux, gratinés, à composer',         'wrap',    40),
  ('pizzas',     'Pizzas',            'Pâte fine, cuisson au four',             'pizza',   50),
  ('pates',      'Pâtes & Plats',     'Les classiques de la maison',            'pasta',   60),
  ('desserts',   'Desserts',          'La touche sucrée',                       'dessert', 70),
  ('boissons',   'Boissons',          'Fraîches et chaudes',                    'drink',   80)
on conflict (slug) do nothing;

-- -- Produits (menu provisoire)
insert into public.products (category_id, name, description, price, is_featured, sort_order)
select c.id, p.name, p.description, p.price, p.is_featured, p.sort_order
from (values
  -- Entrées & Salades
  ('entrees',   'Salade César',          'Laitue croquante, poulet grillé, copeaux de parmesan, sauce César',            11.000, false, 10),
  ('entrees',   'Salade Niçoise',        'Thon, œuf, olives, tomate, pommes de terre',                                   10.500, false, 20),
  ('entrees',   'Salade Roxford',        'Crevettes, avocat, agrumes et vinaigrette maison',                             14.000, true,  30),
  ('entrees',   'Chorba',                'Soupe traditionnelle du jour',                                                  5.000, false, 40),
  ('entrees',   'Bricks à l''œuf',       'Feuille de brick croustillante, thon, câpres',                                  4.500, false, 50),
  -- Sandwichs
  ('sandwichs', 'Sandwich Thon',         'Thon, harissa, olives, œuf, salade méchouia',                                   8.000, false, 10),
  ('sandwichs', 'Sandwich Escalope',     'Escalope de poulet panée, crudités, sauce au choix',                            9.500, false, 20),
  ('sandwichs', 'Sandwich Viande Hachée','Viande hachée épicée, fromage fondu, frites',                                  11.000, false, 30),
  ('sandwichs', 'Chapati Poulet',        'Pain chapati moelleux, poulet mariné, sauce fromagère',                        10.000, true,  40),
  ('sandwichs', 'Makloub Mixte',         'Poulet et viande, fromage, légumes grillés',                                   12.500, false, 50),
  -- Burgers
  ('burgers',   'Classic Burger',        'Steak haché, cheddar, salade, tomate, oignon, sauce burger',                   12.000, false, 10),
  ('burgers',   'Double Cheese',         'Deux steaks, double cheddar, cornichons',                                      16.000, true,  20),
  ('burgers',   'Chicken Crispy',        'Poulet croustillant, coleslaw, sauce épicée',                                  13.000, false, 30),
  ('burgers',   'Roxford Signature',     'Steak, bacon de dinde, cheddar, oignons confits, sauce maison',                18.000, true,  40),
  ('burgers',   'Veggie Burger',         'Galette de légumes, fromage, roquette',                                        11.000, false, 50),
  -- Tacos
  ('tacos',     'Tacos 1 Viande',        'Viande au choix, frites, sauce fromagère, gratiné',                            11.000, false, 10),
  ('tacos',     'Tacos 2 Viandes',       'Deux viandes au choix, frites, sauce fromagère',                               14.000, true,  20),
  ('tacos',     'Tacos 3 Viandes',       'Trio de viandes pour les grandes faims',                                       17.000, false, 30),
  ('tacos',     'Tacos Crevettes',       'Crevettes sautées, sauce algérienne, gratiné',                                 16.000, false, 40),
  -- Pizzas
  ('pizzas',    'Margherita',            'Sauce tomate, mozzarella, basilic',                                             9.000, false, 10),
  ('pizzas',    'Quatre Fromages',       'Mozzarella, gorgonzola, chèvre, parmesan',                                     14.000, false, 20),
  ('pizzas',    'Thon & Câpres',         'Sauce tomate, thon, oignons, olives, câpres',                                  13.000, false, 30),
  ('pizzas',    'Fruits de Mer',         'Crevettes, calamars, moules, ail et persil',                                   18.000, true,  40),
  ('pizzas',    'Pizza Roxford',         'Viande hachée, merguez, poivrons, œuf',                                        16.000, false, 50),
  -- Pâtes & Plats
  ('pates',     'Spaghetti Bolognaise',  'Sauce bolognaise mijotée, parmesan',                                           12.000, false, 10),
  ('pates',     'Penne Quatre Fromages', 'Crème de fromages, poivre noir',                                               13.000, false, 20),
  ('pates',     'Linguine Fruits de Mer','Crevettes, calamars, tomates cerises, ail',                                    19.000, true,  30),
  ('pates',     'Escalope Milanaise',    'Escalope panée, spaghetti, sauce tomate',                                      15.000, false, 40),
  ('pates',     'Grillade Mixte',        'Côtelettes, merguez, escalope, frites et salade',                              20.000, false, 50),
  -- Desserts
  ('desserts',  'Tiramisu',              'Mascarpone, café, cacao',                                                       6.500, false, 10),
  ('desserts',  'Fondant au Chocolat',   'Cœur coulant, glace vanille',                                                   7.000, true,  20),
  ('desserts',  'Crème Brûlée',          'Vanille de Madagascar, caramel croquant',                                       6.500, false, 30),
  ('desserts',  'Salade de Fruits',      'Fruits frais de saison',                                                        5.500, false, 40),
  -- Boissons
  ('boissons',  'Eau Minérale 50cl',     'Plate ou gazeuse',                                                              1.500, false, 10),
  ('boissons',  'Soda',                  'Coca-Cola, Fanta, Sprite, Boga',                                                3.000, false, 20),
  ('boissons',  'Jus Pressé',            'Orange, citronnade ou fraise selon saison',                                     6.000, true,  30),
  ('boissons',  'Café Express',          'Torréfaction maison',                                                           2.500, false, 40),
  ('boissons',  'Thé aux Pignons',       'Thé à la menthe et pignons de pin',                                             4.000, false, 50)
) as p(cat_slug, name, description, price, is_featured, sort_order)
join public.categories c on c.slug = p.cat_slug
on conflict do nothing;

-- -- Galerie (photos de la salle fournies par le restaurant)
insert into public.gallery_images (url, caption, sort_order) values
  ('/photos/salle-1.png',        'La salle et ses hublots de bois',        10),
  ('/photos/salle-2.png',        'Boiseries, laiton et lustres de papier', 20),
  ('/photos/salle-3.png',        'Les banquettes face aux aquariums',      30),
  ('/photos/vitrine-marine.png', 'La vitrine d''objets marins',            40)
on conflict do nothing;

-- ============================================================
--  11. DERNIÈRE ÉTAPE — déclarer le compte administrateur
--
--  a) Dashboard → Authentication → Users → « Add user »
--     Cochez « Auto Confirm User » (sinon la connexion échoue).
--  b) Puis décommentez et exécutez la ligne ci-dessous avec
--     l'adresse e-mail du compte créé :
--
--  insert into public.admin_users (user_id, email)
--  select id, email from auth.users where email = 'VOTRE@EMAIL.COM'
--  on conflict (user_id) do nothing;
-- ============================================================


-- ==========================================================
--  2/4 — Tailles multiples par plat (pizzas L / XL)
--  (source : supabase/migrations/0002_price_variants.sql)
-- ==========================================================

-- ============================================================
--  Roxford — Tailles multiples par plat
--
--  Le panneau-menu du restaurant affiche les pizzas en trois
--  tailles (S / L / XL) avec un prix par taille. Un seul champ
--  « price » ne suffit donc pas.
--
--  price_variants : [{"label": "S", "price": 6.000}, …]
--  Vide  → le plat garde son prix unique (champ price).
--  Rempli → la carte affiche une colonne par taille.
--
--  À exécuter après 0001_init.sql.
-- ============================================================

alter table public.products
  add column if not exists price_variants jsonb not null default '[]'::jsonb;

-- Garde-fou : on veut un tableau, jamais un objet ou un scalaire.
alter table public.products
  drop constraint if exists products_price_variants_is_array;

alter table public.products
  add constraint products_price_variants_is_array
  check (jsonb_typeof(price_variants) = 'array');

comment on column public.products.price_variants is
  'Tailles et prix, ex. [{"label":"S","price":6.000},{"label":"L","price":9.000}]. Tableau vide = prix unique dans la colonne price.';


-- ==========================================================
--  3/4 — Carte reelle du restaurant
--  (source : supabase/migrations/0003_menu_reel.sql)
-- ==========================================================

-- ============================================================
--  Roxford — Carte réelle
--
--  Relevée sur le panneau-menu du restaurant. Remplace le menu
--  provisoire de 0001_init.sql.
--
--  ⚠️  Six prix restent incertains : la seule photo disponible fait
--      460×614 px et ces chiffres-là sont à la limite de lisibilité.
--      Ils sont signalés « VERIFIER » en fin de ligne. Tout est
--      corrigeable depuis /admin en quelques secondes.
--
--  Non repris ici, faute de photo lisible : Petit Cornet,
--  Sandwich McFlash, Suppléments, Extra, Boissons et Menu Enfant,
--  qui figurent sur la carte intérieure. À saisir depuis /admin.
--
--  À exécuter après 0001_init.sql et 0002_price_variants.sql.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Table rase : on retire le menu provisoire.
--    products est supprimé en cascade via categories.
-- ------------------------------------------------------------
delete from public.categories;

-- ------------------------------------------------------------
-- 2. Ajustements de l'établissement
--    Le restaurant est spécialisé fromage, et RestaurantGuru
--    donne 10h–23h (et non 11h).
-- ------------------------------------------------------------
update public.site_settings set
  description = 'Au cœur de Nabeul, Roxford fait du fromage sa signature : pizzas gratinées, sandwichs fondants et gratins généreux, servis dans une salle à l''esprit marin — boiseries chaudes, hublots de laiton et aquariums.',
  hours = '[
    {"day": "Lundi",    "open": "10:00", "close": "23:00", "closed": false},
    {"day": "Mardi",    "open": "10:00", "close": "23:00", "closed": false},
    {"day": "Mercredi", "open": "10:00", "close": "23:00", "closed": false},
    {"day": "Jeudi",    "open": "10:00", "close": "23:00", "closed": false},
    {"day": "Vendredi", "open": "10:00", "close": "23:00", "closed": false},
    {"day": "Samedi",   "open": "10:00", "close": "23:00", "closed": false},
    {"day": "Dimanche", "open": "10:00", "close": "23:00", "closed": false}
  ]'::jsonb
where id = 1;

-- ------------------------------------------------------------
-- 3. Catégories, dans l'ordre du panneau
-- ------------------------------------------------------------
insert into public.categories (slug, name, description, icon, sort_order) values
  ('sand-maqloub',    'Sand. Ma9loub',   'Grillé et garni minute',        'sandwich', 10),
  ('pain-cornet',     'Pain Cornet',     'Le classique de la maison',     'sandwich', 20),
  ('baguette-farcie', 'Baguette Farcie', 'Pain frais, garniture généreuse','sandwich', 30),
  ('sand-roxford',    'Sand. Roxford',   'Nos créations maison',          'burger',   40),
  ('pizzas',          'Pizzas',          'Pâte fine, gratinées au four',  'pizza',    50),
  ('plats',           'Plats',           'Pâtes, poissons et salades',    'pasta',    60);

-- ------------------------------------------------------------
-- 4. Plats à prix unique
--    Le panneau ne porte aucune description : on n'en invente pas.
-- ------------------------------------------------------------
insert into public.products (category_id, name, price, is_featured, sort_order)
select c.id, p.name, p.price, p.is_featured, p.sort_order
from (values
  -- Sand. Ma9loub
  ('sand-maqloub',    'Jambon',                         4.200, false, 10),
  ('sand-maqloub',    'Thon',                           4.200, false, 20),
  ('sand-maqloub',    'Escalope grillée',               4.800, false, 30),
  ('sand-maqloub',    'Escalope panée',                 5.000, false, 40),
  ('sand-maqloub',    'Viande hachée',                  5.500, false, 50),
  -- Pain Cornet
  ('pain-cornet',     'Jambon',                         4.200, false, 10),
  ('pain-cornet',     'Thon',                           4.500, false, 20),
  ('pain-cornet',     'Escalope grillée',               5.000, false, 30),
  ('pain-cornet',     'Escalope panée',                 5.200, false, 40),
  ('pain-cornet',     'Viande hachée',                  5.800, false, 50),
  -- Baguette Farcie
  ('baguette-farcie', 'Jambon',                         4.500, false, 10),
  ('baguette-farcie', 'Thon',                           4.800, false, 20),
  ('baguette-farcie', 'Escalope grillée',               5.500, false, 30),
  ('baguette-farcie', 'Escalope panée',                 5.800, false, 40),
  ('baguette-farcie', 'Viande hachée',                  6.000, false, 50),  -- VERIFIER : 6.000 ou 6.500
  -- Sand. Roxford (Home Made)
  ('sand-roxford',    'Le Charcutier',                  4.500, false, 10),
  ('sand-roxford',    'The Buffalo Chicken',            5.000, false, 20),
  ('sand-roxford',    'Kentucky Fried',                 5.200, false, 30),
  ('sand-roxford',    'Meat Lovers',                    5.500, true,  40),
  ('sand-roxford',    'Cordon Bleu',                    5.500, true,  50),
  ('sand-roxford',    'The Bold',                       6.500, true,  60),
  -- Plats
  ('plats',           'Escalope grillée ou panée',      9.500, false, 10),
  ('plats',           'Escalope sauce aux champignons', 12.000, false, 20),
  ('plats',           'Émincé de volaille au curry',    12.500, false, 30),
  ('plats',           'Complet Poisson',                15.000, false, 40),
  ('plats',           'Calamar doré',                   12.000, false, 50),
  ('plats',           'Spaghetti bolognaise',           9.500, false, 60),
  ('plats',           'Puttanesca',                     8.500, false, 70),
  ('plats',           'Tagliatelle au saumon',          16.000, false, 80),  -- VERIFIER : 16.000 ou 18.000
  ('plats',           'Gratin de Fruits de mer',        15.000, true,  90),
  ('plats',           'Lasagnes',                       9.000, true,  100),
  ('plats',           'Ojja Merguez',                   8.000, false, 110),
  ('plats',           'Ojja Fruits de mer',             9.000, false, 120),  -- VERIFIER : alignement du prix
  ('plats',           'Salade César',                   6.500, false, 130),
  ('plats',           'Salade Roxford',                 7.500, false, 140),
  ('plats',           'Salade Méchouiya',               4.000, false, 150)
) as p(cat_slug, name, price, is_featured, sort_order)
join public.categories c on c.slug = p.cat_slug;

-- ------------------------------------------------------------
-- 5. Pizzas — deux tailles, L et XL
--    price garde le tarif L, pour les affichages à prix unique.
-- ------------------------------------------------------------
insert into public.products
  (category_id, name, price, price_variants, is_featured, sort_order)
select
  c.id,
  p.name,
  p.large,
  jsonb_build_array(
    jsonb_build_object('label', 'L',  'price', p.large),
    jsonb_build_object('label', 'XL', 'price', p.xlarge)
  ),
  p.is_featured,
  p.sort_order
from (values
  ('Margherita',      6.500,  9.500, false, 10),
  ('Neptune',         7.400, 12.000, false, 20),  -- VERIFIER L : 7.400 ou 7.800
  ('Quatre Fromages', 9.800, 14.500, true,  30),  -- VERIFIER L : 9.800 ou 8.800
  ('Végétarienne',    7.500, 11.000, false, 40),
  ('Quatre Saisons',  8.200, 12.500, false, 50),  -- VERIFIER L : 8.200 ou 8.500
  ('Bolonaise',       8.500, 12.000, false, 60),
  ('Regina',          7.500, 11.000, false, 70),
  ('Roxford',        10.800, 18.500, true,  80),  -- VERIFIER : 10.800 / 18.500
  ('Fruits de Mer',  13.000, 16.000, true,  90)
) as p(name, large, xlarge, is_featured, sort_order)
cross join (select id from public.categories where slug = 'pizzas') c;


-- ==========================================================
--  4/4 — Declarer le compte administrateur
--  Le compte admin@roxford.tn doit deja exister dans
--  Authentication → Users (c'est le cas : la connexion a
--  fonctionne, seul le droit d'ecriture manquait).
-- ==========================================================

insert into public.admin_users (user_id, email)
select id, email from auth.users
where email = 'admin@roxford.tn'
on conflict (user_id) do nothing;

-- ==========================================================
--  Verification — doit renvoyer une ligne par element
-- ==========================================================

select 'administrateurs' as objet, count(*)::text as valeur from public.admin_users
union all select 'categories',      count(*)::text from public.categories
union all select 'plats',           count(*)::text from public.products
union all select 'photos galerie',  count(*)::text from public.gallery_images
union all select 'bucket media',    coalesce(max(id), 'ABSENT') from storage.buckets where id = 'media';
