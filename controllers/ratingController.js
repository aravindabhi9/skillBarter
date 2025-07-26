const { Rating, User } = require("../models");

exports.submitRating = async (req, res) => {
  const { userId } = req.params;
  const { rating, comment, bookingId } = req.body;
  const { Booking } = require("../models");
  // Only allow rating after 24h of class completion
  const booking = await Booking.findByPk(bookingId);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  const classDateTime = new Date(`${booking.classDate}T${booking.classTime}`);
  const now = new Date();
  if (now < classDateTime.getTime() + 24 * 60 * 60 * 1000) {
    return res.status(400).json({ message: "Rating only allowed 24h after class completion." });
  }
  const existing = await Rating.findOne({
    where: { fromUserId: req.user.id, toUserId: userId, bookingId },
  });
  if (existing) {
    existing.rating = rating;
    existing.comment = comment;
    await existing.save();
  } else {
    await Rating.create({
      fromUserId: req.user.id,
      toUserId: userId,
      rating,
      comment,
      bookingId
    });
  }
  res.json({ message: "Rating submitted" });
};

exports.getUserRating = async (req, res) => {
  const userId = req.params.userId;
  const ratings = await Rating.findAll({ where: { toUserId: userId } });

  const avg =
    ratings.length === 0
      ? 0
      : (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1);

  res.json({ averageRating: avg, total: ratings.length });
};
