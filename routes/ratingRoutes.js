const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");
const auth = require("../middleware/auth");

router.post("/:userId", auth, ratingController.submitRating);
router.get("/:userId", ratingController.getUserRating);

module.exports = router;
