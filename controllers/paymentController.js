const razorpay = require('../config/razorpay');
const { Booking, Skill } = require('../models');

exports.initiatePayment = async (req, res) => {
  // Accept both bookingId and skillId for backward compatibility
  const { bookingId, amount, skillId, classTime } = req.body;
  try {
    const order = await razorpay.orders.create({
      amount: parseInt(amount) * 100, // paise
      currency: 'INR',
      receipt: bookingId ? `booking_${bookingId}_${Date.now()}` : `skill_${skillId}_${Date.now()}`,
      payment_capture: 1
    });
    res.json({
      razorpayOrderId: order.id,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      bookingId,
      skillId
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to initiate payment' });
    console.log(err);
  }
};
