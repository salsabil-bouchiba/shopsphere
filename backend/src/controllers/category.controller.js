const prisma = require("../config/prisma");
const { asyncHandler } = require("../middleware/asyncHandler");

const listCategories = asyncHandler(async (_req, res) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  res.json({ categories });
});

const getCategory = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: { products: true },
  });
  if (!category) return res.status(404).json({ message: "Catégorie introuvable" });
  res.json({ category });
});

const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: "name est requis" });

  const category = await prisma.category.create({
    data: { name: name.trim() },
  });
  res.status(201).json({ category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: "name est requis" });

  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: { name: name.trim() },
  });
  res.json({ category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const productsCount = await prisma.product.count({
    where: { categoryId: req.params.id },
  });
  if (productsCount > 0) {
    return res.status(400).json({
      message: "Impossible de supprimer une catégorie qui contient des produits",
    });
  }

  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ message: "Catégorie supprimée" });
});

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
