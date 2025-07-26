const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const generateOTP = require("../utils/generateOtp");

exports.signup = async (req, res) => {
  const { name, email, password, phone, whatsapp } = req.body;
  try {
    const existing = await User.findOne({ where: { email } });

    if (existing && existing.isVerified) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const otp = generateOTP();
    const hashed = await bcrypt.hash(password, 10);
    const otpExpiresAt = new Date(Date.now() + 5 * 60000); // 5 mins

    if (existing) {
      await existing.update({ name, password: hashed, phone, whatsapp, otp, otpExpiresAt });
    } else {
      await User.create({ name, email, password: hashed, phone, whatsapp, otp, otpExpiresAt });
    }

    await sendEmail(email, otp);
    console.log("otp:",otp)
    return res.status(200).json({ message: "OTP sent to your email", email });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Signup failed" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || user.otp !== otp || Date.now() > new Date(user.otpExpiresAt).getTime()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }


    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    return res.status(200).json({ message: "OTP verified, registration complete" });
  } catch (err) {
    return res.status(500).json({ message: "Verification failed" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !user.isVerified) {
      return res.status(400).json({ message: "User not found or not verified" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({ token, name: user.name, userId: user.id });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};
