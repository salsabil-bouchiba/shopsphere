const express = require("express");
const {
  createReview,
  listProductReviews,
  deleteReview,
} = require("../controllers/review.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/product/:productId", listProductReviews);
router.post("/", authMiddleware, createReview);
router.delete("/:id", authMiddleware, deleteReview);

module.exports = router;
