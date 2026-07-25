# ShopSphere

Plateforme e-commerce full-stack (portfolio) — Express + Prisma 7 + PostgreSQL + React (Vite).

## Structure

```
ShopSphere/
  backend/    # API Express + Prisma
  frontend/   # App React (Vite)
```

## Prérequis

- Node.js 20+
- PostgreSQL 16 avec une base `shopsphere`

## Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

API : `http://localhost:5000`

Fichier `.env` à la racine de `backend/` (déjà présent). Variable importante : `CLIENT_URL=http://localhost:5173`.

Comptes seed :
- Admin : `admin@shopsphere.com` / `password123`
- User : `user@shopsphere.com` / `password123`

## Frontend

```bash
cd frontend
npm install
npm run dev
```

App : `http://localhost:5173`

Fichier `.env` dans `frontend/` : `VITE_API_URL=http://localhost:5000/api`.

## Documentation détaillée

Voir `backend/README.md` pour Prisma, Stripe, emails, Postman et scripts utiles.