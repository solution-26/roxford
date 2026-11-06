# Roxford — site vitrine + espace propriétaire

Site d'un restaurant, en français, avec une interface d'administration qui
permet au propriétaire de changer le nom, le logo, les horaires, les photos
et toute la carte sans toucher au code.

- **Stack** : Next.js 15 (App Router) · React 19 · Tailwind CSS v4 · Motion · Supabase
- **Design** : bois espresso sur toute la page, filets d'or, serif claire en
  capitales largement espacées (Cormorant Garamond). Le fromage fondu sert de
  liant visuel : grande coulée sous le héros, coulées fines entre les
  sections. Base : système « cafe » d'[open-design](https://github.com/nexu-io/open-design).

---

## 1. Démarrage

```bash
npm install
cp .env.example .env.local   # puis renseignez les deux variables
npm run dev                  # http://localhost:3000
```

### Variables d'environnement

| Variable | Où la trouver |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | même page → clé **publishable** (`sb_publishable_…`) |
| `NEXT_PUBLIC_SITE_URL` | *(facultatif)* URL publique, pour les aperçus de partage |

> **Le site fonctionne même sans Supabase.** Si les variables sont absentes,
> si la base est injoignable ou si une table est vide, le contenu de
> [`lib/seed.ts`](lib/seed.ts) prend le relais. Aucune page ne tombe en erreur.

---

## 2. Initialiser la base

**Le plus simple** : collez [`supabase/setup.sql`](supabase/setup.sql) dans
Supabase → **SQL Editor** → **New query** → **Run**. Ce fichier regroupe les
trois migrations et déclare le compte administrateur, en un seul passage.

Ou, migration par migration, Supabase → **SQL Editor** → **New query**, dans
l'ordre :

| Fichier | Ce qu'il fait |
|---|---|
| [`0001_init.sql`](supabase/migrations/0001_init.sql) | Tables, policies RLS, bucket `media`, contenu de départ |
| [`0002_price_variants.sql`](supabase/migrations/0002_price_variants.sql) | Tailles multiples par plat (les pizzas sont en L et XL) |
| [`0003_menu_reel.sql`](supabase/migrations/0003_menu_reel.sql) | Remplace le menu provisoire par la carte réelle du restaurant |

### Créer le compte administrateur

1. **Authentication → Users → Add user**, en cochant **Auto Confirm User**
2. **SQL Editor** :

```sql
insert into public.admin_users (user_id, email)
select id, email from auth.users where email = 'VOTRE@EMAIL.COM'
on conflict (user_id) do nothing;
```

> ⚠️ L'inscription publique est **activée** sur ce projet Supabase : n'importe
> qui peut créer un compte. C'est pourquoi l'autorisation ne repose pas sur
> « être connecté » mais sur l'appartenance à `admin_users`, vérifiée par la
> fonction `is_admin()` dans **chaque policy d'écriture**. L'interface ne fait
> que refléter cette règle ; la sécurité est appliquée en base.
>
> Pour fermer complètement les inscriptions :
> Authentication → Sign In / Providers → désactiver **Allow new users to sign up**.

---

## 3. Déployer sur Vercel

### Par l'interface (recommandé)

1. Poussez ce dossier sur un dépôt GitHub
2. [vercel.com/new](https://vercel.com/new) → importez le dépôt
3. Ajoutez les deux variables d'environnement (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) — Next.js est détecté automatiquement
4. **Deploy**

### En ligne de commande

```bash
npx vercel login
npx vercel link
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
npx vercel --prod
```

Une fois l'URL connue, ajoutez `NEXT_PUBLIC_SITE_URL` et redéployez pour que
les aperçus de partage pointent au bon endroit.

---

## 4. L'espace propriétaire

Accessible sur **`//admin`** (lien discret en bas du site).

| Onglet | Ce qu'on y fait |
|---|---|
| **Établissement** | Nom, accroche, présentation, logo, photo d'accueil, téléphone, adresse, liens Maps / Facebook / Instagram, budget, devise, horaires jour par jour, services |
| **La carte** | Catégories (créer, renommer, réordonner, masquer) et plats (nom, description, prix, photo, disponibilité, « spécialité ») |
| **Galerie** | Téléverser, légender, réordonner et supprimer les photos |

Points utiles :

- **Masquer** un plat le retire du site sans le supprimer — pratique en rupture.
- Le bandeau **« Ouvert / Fermé »** se calcule tout seul à partir des horaires,
  à l'heure de Nabeul (`Africa/Tunis`), y compris pour un service qui finit
  après minuit.
- Les modifications sont publiées **dès l'enregistrement** : l'administration
  appelle `/api/revalidate`, qui régénère `/` et `/carte`. Cette route exige
  un jeton Supabase appartenant à un compte d'`admin_users`, sinon n'importe
  qui pourrait vider le cache en boucle. En cas d'échec, le délai de
  `revalidate = 60` prend le relais.
- Les images sont envoyées dans le bucket Supabase `media` (5 Mo maximum).

---

## 5. Organisation du code

```
app/
  layout.tsx           métadonnées, polices, données structurées
  page.tsx             la page d'accueil
  carte/page.tsx       la carte complète (page dédiée)
  admin/               espace propriétaire (client, protégé)
components/
  site/                Header, Hero, Marquee, About, CheeseBand,
                       MenuSection, MenuTeaser, Gallery, Visit,
                       Footer, Logo, Reveal, SplitText, ScrollProgress
  admin/               AdminGate (auth), Shell, ImageUploader, ui
lib/
  data.ts              lecture Supabase + repli automatique
  seed.ts              contenu de démonstration
  hours.ts             état ouvert/fermé, format des prix
  types.ts             types partagés
  supabase/            clients navigateur / serveur / public
supabase/migrations/   schéma SQL
public/photos/         photos de la salle
```

---

## 6. Adapter le site à un autre restaurant

Le code ne contient aucune donnée en dur : tout vient de la base.

1. Dupliquez le dépôt
2. Créez un projet Supabase et exécutez la même migration
3. Changez les couleurs dans le bloc `@theme` de
   [`app/globals.css`](app/globals.css) (une quinzaine de variables)
4. Remplacez les photos de `public/photos/`
5. Le reste (nom, logo, carte, horaires) se saisit depuis `/admin`

---

## 7. Notes

- **Accessibilité** : navigation clavier dans la visionneuse, `focus-visible`
  partout, et toutes les animations sont désactivées si le visiteur a demandé
  « réduire les animations » dans son système.
- **SEO** : données structurées `schema.org/Restaurant` (horaires, téléphone,
  adresse), Open Graph, et `/admin` exclu de l'indexation.
- **Impression** : la carte sort proprement sur papier (`@media print`).
- **Six prix sont à vérifier.** La carte vient du panneau-menu du
  restaurant, dont la seule photo disponible fait 460×614 px. Six chiffres
  sont à la limite de lisibilité ; ils sont signalés `VERIFIER` dans
  [`0003_menu_reel.sql`](supabase/migrations/0003_menu_reel.sql).
- **Carte intérieure non reprise** : Petit Cornet, Sandwich McFlash,
  Suppléments, Extra, Boissons et Menu Enfant figurent sur la carte
  intérieure, dont aucune photo lisible n'était disponible. À saisir depuis
  `/admin`.
- **Pas d'onglet « Tout » dans la carte** : 45 plats d'un seul tenant ne se
  lisent pas. On ouvre sur une catégorie — celle du fragment quand on arrive
  par `/carte#pizzas`, la première sinon.
- **Les photos de la salle sont en WebP** (5,9 Mo → 1,1 Mo pour tout le
  dossier). `lib/data.ts` réécrit à la lecture les anciennes références
  `.png` restées en base, pour qu'aucune migration ne soit nécessaire.
- **La carte a deux emplacements.** Sur grand écran elle reste sur la page
  d'accueil ; sur mobile, où elle rendrait la page interminable, l'accueil
  n'affiche qu'un aperçu renvoyant vers `/carte`. Même ancre `#carte`,
  contenu responsive — voir [`app/page.tsx`](app/page.tsx).
- **Photos de fromage** (Unsplash, licence libre y compris commerciale) :
  `fromage-filant.jpg` Brelyn Bashrum · `fondue.jpg` Andri Aeschlimann ·
  `gratin.jpg` Lee Milo · `raclette.jpg` Ahmet Koç. À remplacer par des
  photos du restaurant dès qu'elles sont disponibles — les photos de la
  salle (`salle-*.png`, `vitrine-marine.png`) sont déjà les siennes.
- **Deux palettes cohabitent** : le site public est sombre (bois et or), et
  `/admin` reste clair, un back-office se saisissant mieux sur fond clair.
  Les deux jeux de jetons sont déclarés dans
  [`app/globals.css`](app/globals.css).
