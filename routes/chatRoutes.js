const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const auth = require("../middleware/auth");

router.post("/send", auth, chatController.sendMessage);
router.get("/:otherUserId", auth, chatController.getMessages);

module.exports = router;
