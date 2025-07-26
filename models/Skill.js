// models/Skill.js
module.exports = (sequelize, DataTypes) => {
  const Skill = sequelize.define('Skill', {
    skillName: DataTypes.STRING,
    description: DataTypes.TEXT,
    mode: DataTypes.STRING, // free | paid | barter
    price: DataTypes.INTEGER,
    barterSkillWanted: DataTypes.STRING
  });

  return Skill;
};
