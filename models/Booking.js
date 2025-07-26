module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define("Booking", {
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending"
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    learnerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {   // 👈 THIS IS PROBABLY MISSING
      type: DataTypes.INTEGER,
      allowNull: false
    },
    skillId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  return Booking;
};
