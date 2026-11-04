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

begin;

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

commit;
