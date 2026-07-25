const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

/**
 * Prisma 7 exige un driver adapter (plus de connexion URL directe sur PrismaClient).
 * On utilise @prisma/adapter-pg + le driver `pg`.
 */
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
