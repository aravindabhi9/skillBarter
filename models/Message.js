// models/ChatMessage.js
module.exports = (sequelize, DataTypes) => {
  const ChatMessage = sequelize.define('ChatMessage', {
    senderId: DataTypes.INTEGER,
    content: DataTypes.TEXT,
  });

  return ChatMessage;
};
