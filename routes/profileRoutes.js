const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const auth = require("../middleware/auth");

router.get("/me", auth, profileController.getMyProfile);
router.put("/update", auth, profileController.updateProfile);
router.get("/:userId", auth, profileController.getUserProfileById);

module.exports = router;
