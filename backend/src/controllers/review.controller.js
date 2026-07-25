const prisma = require("../config/prisma");
const { asyncHandler } = require("../middleware/asyncHandler");

/**
 * POST /api/reviews — avis uniquement si le produit a été acheté (commande PAID+)
 */
const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;

  if (!productId || rating == null) {
    return res.status(400).json({ message: "productId et rating sont requis" });
  }

  const score = Number(rating);
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return res.status(400).json({ message: "rating doit être un entier entre 1 et 5" });
  }

  const purchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId: req.user.id,
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
      },
    },
  });

  if (!purchased) {
    return res.status(403).json({
      message: "Vous ne pouvez noter que les produits que vous avez achetés",
    });
  }

  const review = await prisma.review.create({
    data: {
      userId: req.user.id,
      productId,
      rating: score,
      comment: comment || null,
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  res.status(201).json({ review });
});

const listProductReviews = asyncHandler(async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { productId: req.params.productId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ reviews });
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } });
  if (!review) return res.status(404).json({ message: "Avis introuvable" });

  const isOwner = review.userId === req.user.id;
  const isAdmin = req.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: "Accès refusé" });
  }

  await prisma.review.delete({ where: { id: review.id } });
  res.json({ message: "Avis supprimé" });
});

module.exports = { createReview, listProductReviews, deleteReview };
