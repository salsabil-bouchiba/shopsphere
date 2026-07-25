# ShopSphere — Backend

API Express + Prisma 7 + PostgreSQL pour la plateforme e-commerce ShopSphere.

Ce dossier est le **backend** du monorepo. Le frontend Vite se trouve dans le dossier frère `../frontend`.

## Prérequis

- Node.js 20+
- PostgreSQL 16 avec une base `shopsphere`
- Fichier `.env` à la racine de ce dossier (`backend/`)

## Démarrage

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

API : `http://localhost:5000`

Comptes seed :
- Admin : `admin@shopsphere.com` / `password123`
- User : `user@shopsphere.com` / `password123`

### Prisma 7 — point d'attention

- `DATABASE_URL` vit dans `prisma.config.ts` (pas dans `schema.prisma`)
- Un driver adapter est obligatoire : `@prisma/adapter-pg` + `pg`
- Générateur utilisé : `prisma-client-js` (compatible CommonJS / `require`)

### Stripe (optionnel)

Ajoute dans `backend/.env` :
```
STRIPE_SECRET_KEY=sk_test_...
```
Et côté frontend `../frontend/.env` :
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```
Sans clés Stripe, le checkout passe en mode `cod` puis confirmation manuelle.

### Emails

Sans `SMTP_*`, Nodemailer utilise Ethereal et affiche une **Preview URL** dans la console serveur.

## Frontend (dossier frère)

```bash
cd ../frontend
npm install
npm run dev
```

App : `http://localhost:5173`

Le frontend attend `VITE_API_URL=http://localhost:5000/api` et le backend `CLIENT_URL=http://localhost:5173`.

Fonctionnalités UI :
- Catalogue / détail / panier / wishlist / commandes / admin
- JWT (localStorage)
- Dark mode persistant
- i18n FR / EN
- Stripe Elements si clé publishable présente

## Postman

Importer `postman/ShopSphere.postman_collection.json`

## Scripts utiles

| Commande | Rôle |
|----------|------|
| `npm run dev` | API + nodemon |
| `npm run seed` | Données de démo |
| `npm run studio` | Prisma Studio |