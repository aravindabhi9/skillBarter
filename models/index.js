// models/index.js
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models
db.User = require('./User')(sequelize, Sequelize);
db.Skill = require('./Skill')(sequelize, Sequelize);
db.Booking = require('./Booking')(sequelize, Sequelize);
db.ChatMessage = require('./Message')(sequelize, Sequelize);
db.Rating = require('./rating')(sequelize, Sequelize);

// Associations
db.User.hasMany(db.Skill);
db.Skill.belongsTo(db.User);

db.User.hasMany(db.Booking, { foreignKey: 'learnerId' });
db.User.hasMany(db.Booking, { foreignKey: 'providerId' });

db.Booking.belongsTo(db.User, { as: 'Learner', foreignKey: 'learnerId' });
db.Booking.belongsTo(db.User, { as: 'Provider', foreignKey: 'providerId' });

db.Booking.belongsTo(db.Skill);
db.Skill.hasMany(db.Booking);

db.Booking.hasMany(db.ChatMessage);
db.ChatMessage.belongsTo(db.Booking);

db.User.hasMany(db.Rating);
db.Rating.belongsTo(db.User);

module.exports = db;
