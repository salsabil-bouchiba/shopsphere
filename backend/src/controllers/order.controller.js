const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const prisma = require("../config/prisma");
const env = require("../config/env");
const { asyncHandler } = require("../middleware/asyncHandler");
const {
  sendMail,
  orderCreatedEmail,
  orderStatusEmail,
  lowStockEmail,
} = require("../services/mail.service");

let stripe = null;
if (env.stripeSecretKey) {
  stripe = require("stripe")(env.stripeSecretKey);
}

const invoicesDir = path.join(__dirname, "../../uploads/invoices");
fs.mkdirSync(invoicesDir, { recursive: true });

async function generateInvoicePdf(order) {
  const filePath = path.join(invoicesDir, `invoice-${order.id}.pdf`);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(22).text("ShopSphere — Facture", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Facture n° ${order.id}`);
    doc.text(`Date : ${new Date(order.createdAt).toLocaleString("fr-FR")}`);
    doc.text(`Client : ${order.user.name} (${order.user.email})`);
    doc.text(`Statut : ${order.status}`);
    if (order.shippingAddress) doc.text(`Livraison : ${order.shippingAddress}`);
    doc.moveDown();

    doc.fontSize(14).text("Articles", { underline: true });
    doc.moveDown(0.5);

    order.items.forEach((item) => {
      const line = `${item.product.name} × ${item.quantity} — ${(item.price * item.quantity).toFixed(2)} €`;
      doc.fontSize(11).text(line);
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total : ${order.total.toFixed(2)} €`, { align: "right" });
    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return `/uploads/invoices/invoice-${order.id}.pdf`;
}

const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod = "stripe" } = req.body;

  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Le panier est vide" });
  }

  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      return res.status(400).json({
        message: `Stock insuffisant pour "${item.product.name}"`,
      });
    }
  }

  const total = cart.items.reduce(
    (s, i) => s + i.quantity * i.product.price,
    0
  );

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: req.user.id,
        total,
        paymentMethod,
        shippingAddress: shippingAddress || null,
        status: "PENDING",
        items: {
          create: cart.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.product.price,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        user: true,
      },
    });

    for (const item of cart.items) {
      const updatedProduct = await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
      if (updatedProduct.stock <= env.lowStockThreshold) {
        sendMail(lowStockEmail(updatedProduct));
      }
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return created;
  });

  sendMail(orderCreatedEmail(order.user, order));

  let payment = null;
  if (paymentMethod === "stripe" && stripe) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100),
      currency: "eur",
      metadata: { orderId: order.id, userId: req.user.id },
      automatic_payment_methods: { enabled: true },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentId: paymentIntent.id },
    });

    payment = {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  res.status(201).json({ order, payment });
});

const confirmPayment = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      items: { include: { product: true } },
      user: true,
    },
  });

  if (!order) return res.status(404).json({ message: "Commande introuvable" });
  if (order.userId !== req.user.id && req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Accès refusé" });
  }

  if (order.status === "PAID") {
    return res.json({ order, message: "Déjà payée" });
  }

  if (stripe && order.stripePaymentId) {
    const intent = await stripe.paymentIntents.retrieve(order.stripePaymentId);
    if (intent.status !== "succeeded") {
      return res.status(400).json({
        message: `Paiement non confirmé (statut Stripe: ${intent.status})`,
      });
    }
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: "PAID" },
    include: {
      items: { include: { product: true } },
      user: true,
    },
  });

  const invoiceUrl = await generateInvoicePdf(updated);
  sendMail(orderStatusEmail(updated.user, updated));

  res.json({ order: updated, invoiceUrl });
});

const myOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ orders });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      items: { include: { product: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
  if (!order) return res.status(404).json({ message: "Commande introuvable" });
  if (order.userId !== req.user.id && req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Accès refusé" });
  }
  res.json({ order });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: `Statut invalide. Valeurs: ${allowed.join(", ")}` });
  }

  const existing = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: true },
  });
  if (!existing) return res.status(404).json({ message: "Commande introuvable" });

  if (status === "CANCELLED" && existing.status !== "CANCELLED") {
    await prisma.$transaction(async (tx) => {
      for (const item of existing.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      await tx.order.update({
        where: { id: existing.id },
        data: { status },
      });
    });
  } else {
    await prisma.order.update({
      where: { id: existing.id },
      data: { status },
    });
  }

  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      items: { include: { product: true } },
      user: true,
    },
  });

  sendMail(orderStatusEmail(order.user, order));
  res.json({ order });
});

const downloadInvoice = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      items: { include: { product: true } },
      user: true,
    },
  });
  if (!order) return res.status(404).json({ message: "Commande introuvable" });
  if (order.userId !== req.user.id && req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Accès refusé" });
  }
  if (!["PAID", "SHIPPED", "DELIVERED"].includes(order.status)) {
    return res.status(400).json({ message: "Facture disponible après paiement" });
  }

  const filePath = path.join(invoicesDir, `invoice-${order.id}.pdf`);
  if (!fs.existsSync(filePath)) {
    await generateInvoicePdf(order);
  }

  res.download(filePath, `facture-${order.id.slice(0, 8)}.pdf`);
});

module.exports = {
  createOrder,
  confirmPayment,
  myOrders,
  getOrder,
  updateOrderStatus,
  downloadInvoice,
};
