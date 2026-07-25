/**
 * Seed de démo : admin + user + catégories + produits.
 * Usage: node prisma/seed.js
 */
require("dotenv").config();

const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@shopsphere.com" },
    update: {},
    create: {
      email: "admin@shopsphere.com",
      name: "Admin ShopSphere",
      password,
      role: "ADMIN",
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@shopsphere.com" },
    update: {},
    create: {
      email: "user@shopsphere.com",
      name: "Alice Martin",
      password,
      role: "USER",
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  const electronics = await prisma.category.upsert({
    where: { name: "Électronique" },
    update: {},
    create: { name: "Électronique" },
  });
  const fashion = await prisma.category.upsert({
    where: { name: "Mode" },
    update: {},
    create: { name: "Mode" },
  });
  const home = await prisma.category.upsert({
    where: { name: "Maison" },
    update: {},
    create: { name: "Maison" },
  });

  const products = [
    {
      name: "Casque Bluetooth Pro",
      description: "Casque sans fil à réduction de bruit, autonomie 30h.",
      price: 129.99,
      stock: 40,
      categoryId: electronics.id,
      images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"],
    },
    {
      name: "Montre connectée Pulse",
      description: "Suivi sport, notifications et GPS intégré.",
      price: 199.0,
      stock: 25,
      categoryId: electronics.id,
      images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"],
    },
    {
      name: "Sneakers Urban White",
      description: "Baskets légères, confort toute la journée.",
      price: 89.9,
      stock: 60,
      categoryId: fashion.id,
      images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"],
    },
    {
      name: "Veste denim Classic",
      description: "Coupe unisexe, denim stretch premium.",
      price: 79.5,
      stock: 35,
      categoryId: fashion.id,
      images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600"],
    },
    {
      name: "Lampe de bureau LED",
      description: "Éclairage réglable, bras flexible, USB-C.",
      price: 39.99,
      stock: 80,
      categoryId: home.id,
      images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600"],
    },
    {
      name: "Mug céramique Artisan",
      description: "Mug 350ml, finition mate, lave-vaisselle ok.",
      price: 14.5,
      stock: 4,
      categoryId: home.id,
      images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcc036?w=600"],
    },
  ];

  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({ data: p });
    }
  }

  console.log("Seed OK");
  console.log("Admin:", admin.email, "/ password123");
  console.log("User :", user.email, "/ password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
