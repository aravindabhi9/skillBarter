// models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    password: DataTypes.STRING,
    otp: DataTypes.STRING,
    otpExpiresAt: DataTypes.DATE,
    phone: DataTypes.STRING,
    whatsapp: DataTypes.STRING,
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  });

  return User;
};
