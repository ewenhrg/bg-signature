# BG Signature — public catalogue site (independent from Hurghada Dream)

Site public pour **BG Signature** : catalogue d'activités, FR/BG, réservation WhatsApp.

## Démarrage

```bash
cd bg-signature
npm install
cp .env.example .env
# Éditer .env : VITE_WHATSAPP_NUMBER=XXXXXXXXXXX
# Éditer .env : ADMIN_PASSWORD=votre-mot-de-passe
npm run dev:all
```

- Site public : `http://localhost:5173/fr`
- Admin : `http://localhost:5173/admin` (mot de passe = `ADMIN_PASSWORD`)

`npm run dev` lance seulement le front. `npm run server` lance seulement l’API admin. Préférez `npm run dev:all` pour éditer le catalogue.

## Administration

L’admin écrit directement dans les fichiers locaux :

- `data/activities.json` — activités (descriptions FR/BG, prix, jours, pause…)
- `data/site.json` — marque, contacts, WhatsApp
- `public/images/activities/` — upload / suppression de photos

Après une modification, rechargez le site public (Vite recharge en général automatiquement).

**Important :** cet admin est conçu pour l’édition **locale** (PC). Un hébergement static (ex. Vercel) ne conserve pas les écritures fichier — pour la prod, éditez en local puis redéployez, ou branchez plus tard un stockage persistant.

## Données

- `data/activities.json` — catalogue local (aucune connexion à une base externe)
- `data/categories.json` — catégories FR/BG
- `data/site.json` — branding / contact / WhatsApp (fallback)
- `public/images/activities/` — photos locales

Scripts one-shot (jamais utilisés en production) :

- `scripts/one-shot-export.mjs` — export initial depuis la source
- `scripts/import-catalogue.mjs` — normalisation + téléchargement images
- `scripts/fill-bg-names.mjs` — noms bulgares

## Réservation

Parcours : **Activité → Réserver / Резервирай → WhatsApp**

Pas de calendrier, pas de formulaire, pas d’intranet.

## Indépendance

Ce projet ne dépend pas de Supabase, de l’intranet Hurghada Dream, ni d’API de réservation externes.
