const express = require("express");
const {
  listUsers,
  listOrders,
  salesDashboard,
  analytics,
  exportOrdersExcel,
  exportOrdersPdf,
} = require("../controllers/admin.controller");
const { authMiddleware, adminMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/users", listUsers);
router.get("/dashboard", salesDashboard);
router.get("/analytics", analytics);
// Routes export AVANT /orders pour éviter tout conflit de matching
router.get("/orders/export/excel", exportOrdersExcel);
router.get("/orders/export/pdf", exportOrdersPdf);
router.get("/orders", listOrders);

module.exports = router;
