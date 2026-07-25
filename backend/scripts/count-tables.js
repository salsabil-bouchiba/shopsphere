const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

(async () => {
  const names = [
    "user",
    "category",
    "product",
    "cart",
    "cartItem",
    "wishlist",
    "wishlistItem",
    "order",
    "orderItem",
    "review",
  ];
  for (const t of names) {
    console.log(`${t}: ${await prisma[t].count()}`);
  }
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
