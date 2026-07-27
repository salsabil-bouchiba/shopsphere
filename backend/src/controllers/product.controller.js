const prisma = require("../config/prisma");
const env = require("../config/env");
const { asyncHandler } = require("../middleware/asyncHandler");
const { sendMail, lowStockEmail } = require("../services/mail.service");

function buildProductFilters(query) {
  const where = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) where.price.gte = Number(query.minPrice);
    if (query.maxPrice) where.price.lte = Number(query.maxPrice);
  }

  if (query.inStock === "true") {
    where.stock = { gt: 0 };
  } else if (query.inStock === "false") {
    where.stock = { lte: 0 };
  }

  return where;
}

function buildOrderBy(sort) {
  switch (sort) {
    case "price_asc":
      return { price: "asc" };
    case "price_desc":
      return { price: "desc" };
    case "name":
      return { name: "asc" };
    case "oldest":
      return { createdAt: "asc" };
    default:
      return { createdAt: "desc" };
  }
}

const listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 12));
  const skip = (page - 1) * limit;
  const where = buildProductFilters(req.query);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        reviews: { select: { rating: true } },
      },
      orderBy: buildOrderBy(req.query.sort),
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const items = products.map((p) => {
    const avgRating =
      p.reviews.length > 0
        ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
        : null;
    const { reviews, ...rest } = p;
    return {
      ...rest,
      avgRating,
      reviewCount: reviews.length,
      lowStock: p.stock > 0 && p.stock <= env.lowStockThreshold,
    };
  });

  res.json({
    products: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      category: true,
      reviews: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!product) return res.status(404).json({ message: "Produit introuvable" });

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : null;

  res.json({
    product: {
      ...product,
      avgRating,
      lowStock: product.stock > 0 && product.stock <= env.lowStockThreshold,
    },
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, categoryId, images } = req.body;

  if (!name || !description || price == null || !categoryId) {
    return res.status(400).json({
      message: "name, description, price et categoryId sont requis",
    });
  }

  let imageUrls = Array.isArray(images) ? images : images ? [images] : [];
  if (req.files?.length) {
    imageUrls = [
      ...imageUrls,
      ...req.files.map((f) => `/uploads/${f.filename}`),
    ];
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: Number(price),
      stock: Number(stock) || 0,
      categoryId,
      images: imageUrls,
    },
    include: { category: true },
  });

  res.status(201).json({ product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, categoryId, images } = req.body;

  const data = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (price !== undefined) data.price = Number(price);
  if (stock !== undefined) data.stock = Number(stock);
  if (categoryId !== undefined) data.categoryId = categoryId;

  if (images !== undefined) {
    data.images = Array.isArray(images) ? images : [images];
  }
  if (req.files?.length) {
    const uploaded = req.files.map((f) => `/uploads/${f.filename}`);
    data.images = [...(data.images || []), ...uploaded];
  }

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data,
    include: { category: true },
  });

  if (product.stock <= env.lowStockThreshold) {
    sendMail(lowStockEmail(product));
  }

  res.json({ product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ message: "Produit supprimé" });
});

const lowStockProducts = asyncHandler(async (_req, res) => {
  const products = await prisma.product.findMany({
    where: { stock: { lte: env.lowStockThreshold } },
    include: { category: true },
    orderBy: { stock: "asc" },
  });
  res.json({ threshold: env.lowStockThreshold, products });
});

const adjustStock = asyncHandler(async (req, res) => {
  const { stock, delta } = req.body;

  let product;
  if (stock !== undefined) {
    product = await prisma.product.update({
      where: { id: req.params.id },
      data: { stock: Number(stock) },
    });
  } else if (delta !== undefined) {
    product = await prisma.product.update({
      where: { id: req.params.id },
      data: { stock: { increment: Number(delta) } },
    });
  } else {
    return res.status(400).json({ message: "stock ou delta requis" });
  }

  if (product.stock <= env.lowStockThreshold) {
    sendMail(lowStockEmail(product));
  }

  res.json({ product });
});

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  lowStockProducts,
  adjustStock,
};
