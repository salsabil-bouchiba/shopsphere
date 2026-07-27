const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const prisma = require("../config/prisma");
const { asyncHandler } = require("../middleware/asyncHandler");

const PAID_STATUSES = ["PAID", "SHIPPED", "DELIVERED"];

const listUsers = asyncHandler(async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ users });
});

const listOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const where = status ? { status } : {};
  const orders = await prisma.order.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ orders });
});

const salesDashboard = asyncHandler(async (_req, res) => {
  const [revenueAgg, orderCount, pendingCount, productCount, userCount, topProducts] =
    await Promise.all([
      prisma.order.aggregate({
        where: { status: { in: PAID_STATUSES } },
        _sum: { total: true },
        _avg: { total: true },
      }),
      prisma.order.count({ where: { status: { in: PAID_STATUSES } } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.count(),
      prisma.user.count(),
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: { order: { status: { in: PAID_STATUSES } } },
        _sum: { quantity: true },
        _count: { _all: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 10,
      }),
    ]);

  const productIds = topProducts.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { category: true },
  });
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));

  res.json({
    stats: {
      revenue: revenueAgg._sum.total || 0,
      averageOrderValue: revenueAgg._avg.total || 0,
      paidOrders: orderCount,
      pendingOrders: pendingCount,
      productCount,
      userCount,
    },
    topProducts: topProducts.map((row) => ({
      product: byId[row.productId] || null,
      quantitySold: row._sum.quantity || 0,
      orderLines: row._count._all,
    })),
  });
});

const analytics = asyncHandler(async (_req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const orders = await prisma.order.findMany({
    where: {
      status: { in: PAID_STATUSES },
      createdAt: { gte: since },
    },
    select: { total: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const byDay = {};
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    if (!byDay[key]) byDay[key] = { date: key, revenue: 0, orders: 0 };
    byDay[key].revenue += o.total;
    byDay[key].orders += 1;
  }

  const items = await prisma.orderItem.findMany({
    where: { order: { status: { in: PAID_STATUSES } } },
    include: { product: { include: { category: true } } },
  });

  const cats = {};
  for (const item of items) {
    const cat = item.product.category;
    if (!cats[cat.id]) {
      cats[cat.id] = { category: cat, quantitySold: 0, revenue: 0 };
    }
    cats[cat.id].quantitySold += item.quantity;
    cats[cat.id].revenue += item.quantity * item.price;
  }

  res.json({
    salesOverTime: Object.values(byDay),
    topCategories: Object.values(cats).sort((a, b) => b.revenue - a.revenue),
  });
});

const exportOrdersExcel = asyncHandler(async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Orders");
  sheet.columns = [
    { header: "Order ID", key: "id", width: 38 },
    { header: "Date", key: "date", width: 22 },
    { header: "Customer", key: "customer", width: 24 },
    { header: "Email", key: "email", width: 28 },
    { header: "Status", key: "status", width: 12 },
    { header: "Total", key: "total", width: 12 },
    { header: "Items", key: "items", width: 50 },
  ];

  for (const o of orders) {
    sheet.addRow({
      id: o.id,
      date: o.createdAt.toISOString(),
      customer: o.user.name,
      email: o.user.email,
      status: o.status,
      total: o.total,
      items: o.items.map((i) => `${i.product.name} x${i.quantity}`).join(", "),
    });
  }

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=orders.xlsx");
  await workbook.xlsx.write(res);
  res.end();
});

const exportOrdersPdf = asyncHandler(async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=orders.pdf");

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(res);
  doc.fontSize(18).text("ShopSphere — Export commandes", { align: "center" });
  doc.moveDown();

  orders.forEach((o) => {
    doc
      .fontSize(10)
      .text(
        `${o.createdAt.toISOString().slice(0, 10)} | ${o.id.slice(0, 8)} | ${o.user.name} | ${o.status} | ${o.total.toFixed(2)} €`
      );
  });

  doc.end();
});

module.exports = {
  listUsers,
  listOrders,
  salesDashboard,
  analytics,
  exportOrdersExcel,
  exportOrdersPdf,
};
