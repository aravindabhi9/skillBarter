const express = require("express");
const router = express.Router();
const skillController = require("../controllers/skillController");
const auth = require("../middleware/auth");

router.post("/add", auth, skillController.addSkill);
router.put("/edit/:id", auth, skillController.editSkill);
router.delete("/delete/:id", auth, skillController.deleteSkill);
router.get("/mine", auth, skillController.getMySkills);
router.get("/suggestions", auth, skillController.suggestions);
router.get("/all", auth, skillController.getAllSkills);

module.exports = router;
