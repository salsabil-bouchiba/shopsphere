const prisma = require("../config/prisma");
const { asyncHandler } = require("../middleware/asyncHandler");

async function getOrCreateCart(userId) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: { include: { category: true } },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
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

  return cart;
}

function withTotals(cart) {
  const items = cart.items.map((item) => ({
    ...item,
    lineTotal: item.quantity * item.product.price,
  }));
  const total = items.reduce((s, i) => s + i.lineTotal, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  return { ...cart, items, total, itemCount };
}

const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  res.json({ cart: withTotals(cart) });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ message: "productId requis" });

  const qty = Math.max(1, Number(quantity) || 1);
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(404).json({ message: "Produit introuvable" });
  if (product.stock < qty) {
    return res.status(400).json({ message: "Stock insuffisant" });
  }

  const cart = await getOrCreateCart(req.user.id);

  await prisma.cartItem.upsert({
    where: {
      cartId_productId: { cartId: cart.id, productId },
    },
    create: { cartId: cart.id, productId, quantity: qty },
    update: { quantity: { increment: qty } },
  });

  const updated = await getOrCreateCart(req.user.id);
  res.status(201).json({ cart: withTotals(updated) });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1) {
    return res.status(400).json({ message: "quantity doit être un entier >= 1" });
  }

  const cart = await getOrCreateCart(req.user.id);
  const item = await prisma.cartItem.findFirst({
    where: { id: req.params.itemId, cartId: cart.id },
    include: { product: true },
  });
  if (!item) return res.status(404).json({ message: "Article introuvable dans le panier" });
  if (item.product.stock < qty) {
    return res.status(400).json({ message: "Stock insuffisant" });
  }

  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: qty },
  });

  const updated = await getOrCreateCart(req.user.id);
  res.json({ cart: withTotals(updated) });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  const item = await prisma.cartItem.findFirst({
    where: { id: req.params.itemId, cartId: cart.id },
  });
  if (!item) return res.status(404).json({ message: "Article introuvable dans le panier" });

  await prisma.cartItem.delete({ where: { id: item.id } });
  const updated = await getOrCreateCart(req.user.id);
  res.json({ cart: withTotals(updated) });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  const updated = await getOrCreateCart(req.user.id);
  res.json({ cart: withTotals(updated), message: "Panier vidé" });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
