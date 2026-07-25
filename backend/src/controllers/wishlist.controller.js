const prisma = require("../config/prisma");
const { asyncHandler } = require("../middleware/asyncHandler");

async function getOrCreateWishlist(userId) {
  let wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: { include: { category: true } },
        },
      },
    },
  });

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: { include: { category: true } },
          },
        },
      },
    });
  }

  return wishlist;
}

const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user.id);
  res.json({ wishlist });
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ message: "productId requis" });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(404).json({ message: "Produit introuvable" });

  const wishlist = await getOrCreateWishlist(req.user.id);

  await prisma.wishlistItem.upsert({
    where: {
      wishlistId_productId: { wishlistId: wishlist.id, productId },
    },
    create: { wishlistId: wishlist.id, productId },
    update: {},
  });

  const updated = await getOrCreateWishlist(req.user.id);
  res.status(201).json({ wishlist: updated });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user.id);
  const item = await prisma.wishlistItem.findFirst({
    where: {
      wishlistId: wishlist.id,
      OR: [{ id: req.params.itemId }, { productId: req.params.itemId }],
    },
  });

  if (!item) {
    return res.status(404).json({ message: "Article introuvable dans la wishlist" });
  }

  await prisma.wishlistItem.delete({ where: { id: item.id } });
  const updated = await getOrCreateWishlist(req.user.id);
  res.json({ wishlist: updated });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
