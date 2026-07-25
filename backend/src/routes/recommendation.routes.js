const express = require("express");
const { getRecommendations } = require("../controllers/recommendation.controller");
const { optionalAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", optionalAuth, getRecommendations);

module.exports = router;
