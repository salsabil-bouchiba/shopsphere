const express = require("express");
const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  lowStockProducts,
  adjustStock,
} = require("../controllers/product.controller");
const { authMiddleware, adminMiddleware } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/upload.middleware");

const router = express.Router();

router.get("/", listProducts);
router.get("/inventory/low-stock", authMiddleware, adminMiddleware, lowStockProducts);
router.get("/:id", getProduct);
router.post("/", authMiddleware, adminMiddleware, upload.array("images", 5), createProduct);
router.put("/:id", authMiddleware, adminMiddleware, upload.array("images", 5), updateProduct);
router.patch("/:id/stock", authMiddleware, adminMiddleware, adjustStock);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;
