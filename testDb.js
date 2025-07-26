// testDB.js
require('dotenv').config(); // load .env

const sequelize = require('./config/database'); // adjust path if needed

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Sequelize connected successfully to MySQL!');
  } catch (error) {
    console.error('❌ Sequelize failed to connect:', error.message);
  }
})();
