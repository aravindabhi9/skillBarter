const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");
const { ChatMessage } = require("../models");
const chatMessage = sequelize.define("ChatMessage", {
  senderId: DataTypes.INTEGER,
  receiverId: DataTypes.INTEGER,
  content: DataTypes.TEXT,
});

exports.sendMessage = async (req, res) => {
  const { receiverId, content, bookingId } = req.body;
  // Only allow chat if booking is paid
  if (bookingId) {
    const { Booking } = require("../models");
    const booking = await Booking.findByPk(bookingId);
    if (!booking || !booking.isPaid) {
      return res.status(403).json({ message: "Chat not allowed until payment." });
    }
  }
  const msg = await ChatMessage.create({
    senderId: req.user.id,
    receiverId,
    content,
  });
  res.status(200).json(msg);
};

exports.getMessages = async (req, res) => {
  const { otherUserId } = req.params;

  const messages = await ChatMessage.findAll({
    where: {
      [require("sequelize").Op.or]: [
        { senderId: req.user.id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: req.user.id },
      ],
    },
    order: [["createdAt", "ASC"]],
  });

  res.json(messages);
};
