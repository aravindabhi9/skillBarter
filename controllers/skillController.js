const { Skill, User } = require("../models");

exports.addSkill = async (req, res) => {
  const { skillName, description, mode, price, barterSkillWanted } = req.body;
  try {
    const skill = await Skill.create({
      skillName,
      description,
      mode,
      price: mode === "paid" ? price : null,
      barterSkillWanted: mode === "barter" ? barterSkillWanted : null,
      UserId: req.user.id,
    });
    res.status(200).json(skill);
  } catch (err) {
    res.status(500).json({ message: "Failed to add skill" });
  }
};

exports.getMySkills = async (req, res) => {
  const skills = await Skill.findAll({ where: { UserId: req.user.id } });
  res.json(skills);
};

exports.editSkill = async (req, res) => {
  const { id } = req.params;
  const { skillName, description, mode, price, barterSkillWanted } = req.body;

  try {
    const skill = await Skill.findByPk(id);
    if (!skill || skill.UserId !== req.user.id)
      return res.status(404).json({ message: "Skill not found" });

    skill.skillName = skillName;
    skill.description = description;
    skill.mode = mode;
    skill.price = mode === "paid" ? price : null;
    skill.barterSkillWanted = mode === "barter" ? barterSkillWanted : null;

    await skill.save();
    res.json({ message: "Skill updated" });
  } catch (err) {
    res.status(500).json({ message: "Edit failed" });
  }
};

exports.deleteSkill = async (req, res) => {
  const { id } = req.params;
  try {
    const skill = await Skill.findByPk(id);
    if (!skill || skill.UserId !== req.user.id)
      return res.status(404).json({ message: "Not found" });

    await skill.destroy();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Deletion failed" });
  }
};

exports.searchSkills = async (req, res) => {
  const { q } = req.query;
  const skills = await Skill.findAll({
    where: {
      skillName: { [require("sequelize").Op.like]: `%${q}%` },
    },
    include: User,
  });
  res.json(skills);
};

exports.suggestions = async (req, res) => {
  const { q } = req.query;
  const skills = await Skill.findAll({
    where: {
      skillName: { [require("sequelize").Op.like]: `%${q}%` },
    },
    limit: 5,
  });
  res.json(skills);
};

exports.getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.findAll({ include: User });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch skills" });
  }
};
