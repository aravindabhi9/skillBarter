const jwt = require("jsonwebtoken");

module.exports = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};
