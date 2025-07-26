// models/Rating.js
module.exports = (sequelize, DataTypes) => {
  const Rating = sequelize.define('Rating', {
    rating: DataTypes.FLOAT,
    comment: DataTypes.TEXT,
    fromUserId: DataTypes.INTEGER,
    toUserId: DataTypes.INTEGER,
    bookingId: DataTypes.INTEGER
  });
  return Rating;
};
