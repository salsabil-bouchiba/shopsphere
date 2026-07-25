const express = require("express");
const {
  createOrder,
  confirmPayment,
  myOrders,
  getOrder,
  updateOrderStatus,
  downloadInvoice,
} = require("../controllers/order.controller");
const { authMiddleware, adminMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);
router.post("/", createOrder);
router.get("/mine", myOrders);
router.get("/:id", getOrder);
router.post("/:id/confirm-payment", confirmPayment);
router.get("/:id/invoice", downloadInvoice);
router.patch("/:id/status", adminMiddleware, updateOrderStatus);

module.exports = router;
