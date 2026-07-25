const express = require("express");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlist.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getWishlist);
router.post("/items", addToWishlist);
router.delete("/items/:itemId", removeFromWishlist);

module.exports = router;
