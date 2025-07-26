// Mark class as done after scheduled time, disable chat/schedule, and send WhatsApp contacts
const sendEmail = require("../utils/sendEmail");
exports.markClassDone = async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findByPk(bookingId, { include: [Skill, { model: require("../models").User, as: "Learner" }, { model: require("../models").User, as: "Provider" }] });
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  // Check if class time has passed
  const classDateTime = new Date(`${booking.classDate}T${booking.classTime}`);
  if (Date.now() < classDateTime.getTime()) {
    return res.status(400).json({ message: "Class time has not passed yet." });
  }
  booking.status = "done";
  await booking.save();
  // Send WhatsApp contacts, thank you, and rating link to both users
  const learner = booking.Learner;
  const provider = booking.Provider;
  const learnerWhatsapp = learner.whatsappNumber || learner.whatsapp || learner.phone || "Not provided";
  const providerWhatsapp = provider.whatsappNumber || provider.whatsapp || provider.phone || "Not provided";
  const skillName = booking.Skill?.skillName || "the skill";
  // Rating links
  const learnerRatingLink = `${process.env.BASE_URL || "http://localhost:3000"}/rating.html?bookingId=${booking.id}&toUserId=${provider.id}`;
  const providerRatingLink = `${process.env.BASE_URL || "http://localhost:3000"}/rating.html?bookingId=${booking.id}&toUserId=${learner.id}`;
  // Email bodies
  const learnerMsg = `Thank you for attending your class for ${skillName}!\n\nYou can contact your provider for doubts via WhatsApp: ${providerWhatsapp}.\n\nPlease rate your experience: ${learnerRatingLink}`;
  const providerMsg = `Thank you for teaching your class for ${skillName}!\n\nYou can contact your learner for doubts via WhatsApp: ${learnerWhatsapp}.\n\nPlease rate your experience: ${providerRatingLink}`;
  await sendEmail(learner.email, "Class Completed! WhatsApp & Rating", learnerMsg);
  await sendEmail(provider.email, "Class Completed! WhatsApp & Rating", providerMsg);
  res.json({ message: "Class marked as done, WhatsApp contacts and rating links sent to both users." });
};
// Get all paid bookings for provider (for chat list)
exports.getProviderChats = async (req, res) => {
  const bookings = await Booking.findAll({
    where: { userId: req.user.id, isPaid: true },
    include: [
      { model: Skill },
      { model: require("../models").User, as: "Learner" }
    ]
  });
  res.json(bookings);
};
// Get a single booking by ID (for chat unlock, etc)
exports.getBookingById = async (req, res) => {
  const booking = await Booking.findByPk(req.params.bookingId);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  res.json(booking);
};
// Get bookings for the learner (user1)
const { Booking, Skill, User } = require("../models");
exports.getMyBookings = async (req, res) => {
  const bookings = await Booking.findAll({
    where: { learnerId: req.user.id },
    include: [Skill]
  });
  res.json(bookings);
};



exports.bookSkill = async (req, res) => {
  const skill = await Skill.findByPk(req.params.skillId);
  if (!skill) return res.status(404).json({ message: "Skill not found" });
console.log("Skill.UserId:", skill.UserId); // 🔍 Debug this

  const booking = await Booking.create({
    learnerId: req.user.id,      // The user booking the skill (learner)
    userId: skill.UserId,        // The provider (owner of the skill)
    skillId: skill.id,
    status: "pending",
  });

  const provider = await User.findByPk(skill.UserId);
  await sendEmail(provider.email, `New booking for ${skill.skillName}`);

  res.status(200).json({ message: "Booking sent", booking });
};

exports.getRequests = async (req, res) => {
  const requests = await Booking.findAll({
    where: { status: "pending" },
    include: [{ model: Skill, where: { UserId: req.user.id } }, { model: User, as: "Learner" }],
  });
  res.json(requests);
};

exports.respondBooking = async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findByPk(req.params.bookingId);
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  booking.status = status;
  await booking.save();

  const learner = await User.findByPk(booking.learnerId);
  await sendEmail(learner.email, `Booking ${status}. Contact provider to fix timing.`);

  res.json({ message: `Booking ${status}` });
};

exports.scheduleClass = async (req, res) => {
  const { bookingId } = req.params;
  const { date, time } = req.body;
  const booking = await Booking.findByPk(bookingId, { include: [
    { model: User, as: "Learner" },
    { model: User, as: "Provider" },
    Skill
  ] });
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  booking.classDate = date;
  booking.classTime = time;
  booking.status = "scheduled";
  await booking.save();

  // Send schedule confirmation emails to both users
  const learner = booking.Learner;
  const provider = booking.Provider;
  const skillName = booking.Skill?.skillName || "the skill";
  const dateTimeStr = `${date} at ${time}`;
  const learnerMsg = `Your class for ${skillName} is scheduled on ${dateTimeStr}. Please be on time!`;
  const providerMsg = `You have a class for ${skillName} scheduled with a learner on ${dateTimeStr}. Please be on time!`;
  await sendEmail(learner.email, "Class Scheduled!", learnerMsg);
  await sendEmail(provider.email, "Class Scheduled!", providerMsg);

  res.json({ message: "Class scheduled", booking });
};
// Payment endpoint: learner pays, unlock chat
exports.payForBooking = async (req, res) => {
  const { bookingId } = req.params;
  // Razorpay payment verification would go here
  const booking = await Booking.findByPk(bookingId);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  booking.isPaid = true;
  booking.status = "paid";
  await booking.save();
  res.json({ message: "Payment successful. Chat unlocked." });
};

// Reschedule meeting
exports.rescheduleMeeting = async (req, res) => {
  const { bookingId } = req.params;
  const { date, time } = req.body;
  const booking = await Booking.findByPk(bookingId);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  // Only allow rescheduling if more than 6 hours before class
  const classDateTime = new Date(`${booking.classDate}T${booking.classTime}`);
  const now = new Date();
  const diffHours = (classDateTime - now) / (1000 * 60 * 60);
  if (diffHours <= 6) {
    return res.status(400).json({ message: "Rescheduling only allowed more than 6 hours before class." });
  }
  booking.classDate = date;
  booking.classTime = time;
  booking.status = "rescheduled";
  await booking.save();
  res.json({ message: "Meeting rescheduled", booking });
};

// After class, allow rating
exports.allowRating = async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findByPk(bookingId);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  const now = Date.now();
  const classDate = new Date(booking.classDate).getTime();
  const classTime = booking.classTime ? new Date(`${booking.classDate}T${booking.classTime}`).getTime() : classDate;
  if (now < classTime + 24 * 60 * 60 * 1000) {
    return res.status(400).json({ message: "Rating only allowed 24h after class" });
  }
  res.json({ message: "Rating allowed" });
};
