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
