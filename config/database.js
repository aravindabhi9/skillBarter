const Sequelize = require("sequelize");
require('dotenv').config(); 
const sequelize = new Sequelize(
  process.env.DB_NAME,     // e.g., 'skillbarter'
  process.env.DB_USER,     // e.g., 'root'
  process.env.DB_PASS, // e.g., 'yourpassword'
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = sequelize;
