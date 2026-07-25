<div align="center">

# 🛍️ ShopSphere

**L'essentiel du shopping, sans friction.**

Plateforme e-commerce full-stack moderne — catalogue produits, panier, favoris, commandes, paiements, admin et authentification JWT.

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

<!-- Remplace l’URL de démo quand tu déploies (Vercel / Render / Railway…) -->
[Démo Live](https://github.com/salsabil-bouchiba/shopsphere) ·
[Signaler un bug](https://github.com/salsabil-bouchiba/shopsphere/issues) ·
[Proposer une fonctionnalité](https://github.com/salsabil-bouchiba/shopsphere/issues)

</div>

---

## 📸 Aperçu

> Ajoute tes captures dans `docs/screenshots/` puis décommente les images ci-dessous.

<div align="center">

<!--
<img src="docs/screenshots/home.png" alt="Page d'accueil ShopSphere" width="800"/>
<p><em>Page d'accueil — hero carrousel & offres</em></p>

<img src="docs/screenshots/catalogue.png" alt="Catalogue produits" width="800"/>
<p><em>Catalogue — filtres, grille / liste</em></p>

<img src="docs/screenshots/product.png" alt="Fiche produit" width="800"/>
<p><em>Fiche produit — galerie & avis</em></p>
-->

<p><em>Astuce : lance le projet en local, capture Home / Catalogue / Produit, place les PNG dans <code>docs/screenshots/</code>.</em></p>

</div>

---

## ✨ Fonctionnalités

### Client
- 🛒 **Catalogue** — recherche, chips catégories, filtre stock, slider prix, tri, pagination, vue grille/liste
- 🧺 **Panier** — ajout / quantités (+/−) / suppression / checkout
- ❤️ **Favoris (wishlist)** — ajouter / retirer des produits
- 📦 **Commandes** — historique + timeline de statut (PENDING → PAID → SHIPPED → DELIVERED)
- 🔐 **Auth JWT** — inscription, connexion, routes protégées, rôles USER / ADMIN
- ⭐ **Avis produits** — note + commentaire (après achat)
- 🎁 **Recommandations** — produits similaires / populaires
- 🌐 **i18n FR / EN** — `react-i18next`
- 🌗 **Dark / Light mode** — persistant (`localStorage`)
- 📱 **Responsive** — mobile-first
- 📄 Pages légales — À propos, Contact, CGV, FAQ

### Admin
- 📊 **Dashboard** — CA, commandes, top produits
- 📈 **Analytics** — ventes dans le temps, top catégories
- 📤 **Exports** — commandes en Excel & PDF
- 🏷️ CRUD catégories & produits (upload images)
- 📉 Alerte stock bas

### Paiement & emails
- 💳 **Stripe** (mode test, optionnel) — sinon checkout démo (COD + confirmation)
- 📧 **Emails** — bienvenue, commande, changement de statut (Nodemailer / Ethereal en dev)
- 🧾 **Facture PDF** après paiement

---

## 🛠️ Stack technique

### Frontend
| Techno | Rôle |
|--------|------|
| **React 19** + **Vite** | SPA |
| **React Router DOM** | Routing |
| **Axios** | Appels API + interceptor JWT |
| **Context API** | Auth + thème (pas de Redux/Zustand) |
| **CSS custom** (variables) | Design system *Deep Teal Luxe* |
| **i18next / react-i18next** | FR / EN |
| **Stripe.js / React Stripe** | Paiement côté client |

### Backend
| Techno | Rôle |
|--------|------|
| **Node.js** + **Express 5** | API REST |
| **PostgreSQL** | Base de données |
| **Prisma 7** + **@prisma/adapter-pg** | ORM |
| **JWT** (`jsonwebtoken`) | Auth |
| **bcrypt** | Hash mots de passe |
| **Multer** | Upload images produits |
| **Stripe** | PaymentIntents |
| **Nodemailer** | Emails |
| **PDFKit** | Factures PDF |
| **ExcelJS** | Export Excel admin |
| **CORS** + **dotenv** | Config & sécurité navigateur |

---

## 🚀 Installation locale

### Prérequis
- Node.js **20+**
- PostgreSQL **16+** avec une base `shopsphere`
- npm

### 1. Cloner

```bash
git clone https://github.com/salsabil-bouchiba/shopsphere.git
cd shopsphere
```

### 2. Backend

```bash
cd backend
npm install

# Créer le fichier .env (voir section Variables d'environnement)
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

API → [http://localhost:5000](http://localhost:5000)  
Health → [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 3. Frontend (autre terminal)

```bash
cd frontend
npm install
npm run dev
```

App → [http://localhost:5173](http://localhost:5173)

### Comptes de démo (après `npm run seed`)

| Rôle | Email | Mot de passe |
|------|--------|--------------|
| Admin | `admin@shopsphere.com` | `password123` |
| User | `user@shopsphere.com` | `password123` |

---

## 🔐 Variables d'environnement

### `backend/.env`

```env
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/shopsphere?schema=public"
JWT_SECRET="change_moi_en_secret_long"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"

LOW_STOCK_THRESHOLD=5

# Optionnel — si vide, Nodemailer utilise Ethereal (preview URL en console)
# SMTP_HOST=
# SMTP_PORT=587
# SMTP_USER=
# SMTP_PASS=
# SMTP_FROM="ShopSphere <noreply@shopsphere.local>"

# Optionnel — Stripe test (https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

> **Prisma 7 :** `DATABASE_URL` est lu via `prisma.config.ts` (pas dans le bloc `datasource` de `schema.prisma`).

### `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=
```

---

## 📂 Structure du projet

```
ShopSphere/
├── frontend/                 # Client React (Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/              # Axios client
│   │   ├── components/       # UI (Navbar, Footer, ProductCard…)
│   │   ├── context/          # AuthContext, ThemeContext
│   │   ├── i18n/             # fr.json / en.json
│   │   ├── pages/            # Home, Products, Cart, Admin…
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css         # Design system
│   ├── .env
│   └── package.json
│
├── backend/                  # API Express
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.js
│   ├── postman/              # Collection API
│   ├── src/
│   │   ├── config/           # env.js, prisma.js
│   │   ├── controllers/
│   │   ├── middleware/       # auth, upload, errors
│   │   ├── routes/
│   │   ├── services/         # mail.service.js
│   │   └── index.js          # Point d'entrée
│   ├── uploads/              # Images & factures
│   ├── prisma.config.ts
│   ├── .env
│   └── package.json
│
├── docs/
│   └── screenshots/          # Captures pour le README
└── README.md
```

---

## 📡 API (aperçu)

| Préfixe | Description |
|---------|-------------|
| `POST /api/auth/register` · `login` · `GET /me` | Authentification |
| `/api/categories` · `/api/products` | Catalogue (CRUD admin) |
| `/api/cart` · `/api/wishlist` | Panier & favoris (JWT) |
| `/api/orders` | Commandes, paiement, facture |
| `/api/reviews` | Avis |
| `/api/admin` | Dashboard, analytics, exports |
| `/api/recommendations` | Recommandations produits |

Collection Postman : `backend/postman/ShopSphere.postman_collection.json`

---

## 🎯 Roadmap

### Fait
- [x] Auth JWT + rôles admin
- [x] Catalogue, panier, wishlist, commandes
- [x] Avis clients
- [x] Stripe (mode test, optionnel)
- [x] Emails (Nodemailer)
- [x] Dashboard admin + exports
- [x] i18n FR/EN + dark mode
- [x] UI premium (hero carrousel, fiche produit enrichie)

### À venir
- [ ] Déploiement production (frontend + API + Postgres)
- [ ] Webhooks Stripe complets
- [ ] Recherche avancée / suggestions
- [ ] Tests automatisés (API + UI)
- [ ] CI/CD GitHub Actions

---

## 👤 Auteur

**Salsabil Bouchiba**

- GitHub : [@salsabil-bouchiba](https://github.com/salsabil-bouchiba)
- LinkedIn : [linkedin.com/in/salsabil-bouchiba](https://www.linkedin.com/in/salsabil-bouchiba) <!-- mets ton vrai URL LinkedIn -->
- Portfolio : <!-- ajoute ton lien portfolio ici -->

---

## 📄 Licence

Ce projet est sous licence **MIT** — voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">

Si ce projet t’a plu, n’hésite pas à lui laisser une ⭐ sur GitHub !

</div>
