const prisma = require("../config/prisma");
const { asyncHandler } = require("../middleware/asyncHandler");

const getRecommendations = asyncHandler(async (req, res) => {
  const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 8));
  const { productId } = req.query;

  if (productId) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: "Produit introuvable" });

    const similar = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId },
        stock: { gt: 0 },
      },
      include: { category: true },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      strategy: "same_category",
      products: similar,
    });
  }

  if (req.user?.id) {
    const purchased = await prisma.orderItem.findMany({
      where: {
        order: {
          userId: req.user.id,
          status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
        },
      },
      include: { product: true },
    });

    if (purchased.length > 0) {
      const boughtIds = [...new Set(purchased.map((i) => i.productId))];
      const categoryIds = [...new Set(purchased.map((i) => i.product.categoryId))];

      const popularInCats = await prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
          product: { categoryId: { in: categoryIds } },
          productId: { notIn: boughtIds },
          order: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: limit,
      });

      let products = [];
      if (popularInCats.length > 0) {
        const ids = popularInCats.map((p) => p.productId);
        const found = await prisma.product.findMany({
          where: { id: { in: ids }, stock: { gt: 0 } },
          include: { category: true },
        });
        const orderMap = Object.fromEntries(ids.map((id, idx) => [id, idx]));
        products = found.sort((a, b) => orderMap[a.id] - orderMap[b.id]);
      }

      if (products.length < limit) {
        const extra = await prisma.product.findMany({
          where: {
            categoryId: { in: categoryIds },
            id: { notIn: [...boughtIds, ...products.map((p) => p.id)] },
            stock: { gt: 0 },
          },
          include: { category: true },
          take: limit - products.length,
        });
        products = [...products, ...extra];
      }

      return res.json({
        strategy: "purchase_history_categories",
        products,
      });
    }
  }

  const top = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { order: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  let products = [];
  if (top.length > 0) {
    const ids = top.map((t) => t.productId);
    const found = await prisma.product.findMany({
      where: { id: { in: ids }, stock: { gt: 0 } },
      include: { category: true },
    });
    const orderMap = Object.fromEntries(ids.map((id, idx) => [id, idx]));
    products = found.sort((a, b) => orderMap[a.id] - orderMap[b.id]);
  }

  if (products.length < limit) {
    const extra = await prisma.product.findMany({
      where: {
        id: { notIn: products.map((p) => p.id) },
        stock: { gt: 0 },
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: limit - products.length,
    });
    products = [...products, ...extra];
  }

  res.json({
    strategy: "popular_fallback",
    products,
  });
});

module.exports = { getRecommendations };
