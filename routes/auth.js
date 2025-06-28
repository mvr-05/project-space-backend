const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendMail = require("../utils/mailer");

const router = express.Router();

// Helper: generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 📌 Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    const user = new User({
      username,
      email,
      password: hashed,
      otp,
      otpExpiry
    });

    await user.save();
    await sendMail(email, "Account Confirmation", `Your OTP is: ${otp}`);

    res.json({ msg: "Signup successful. Please verify your email." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


// 📌 Verify OTP
router.post("/verify", async (req, res) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || Date.now() > user.otpExpiry)
        return res.status(400).json({ msg: "Invalid or expired OTP" });

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ msg: "Account verified successfully." });
});

// 📌 Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "User not found" });
    if (!user.isVerified) return res.status(403).json({ msg: "Verify email first" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Return more user details
    res.json({
      token,
      _id: user._id,
      username: user.username,
      email: user.email
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


// 📌 Forgot Password - Send OTP
router.post("/forgot", async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000;
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendMail(email, "Password Reset OTP", `Your OTP is: ${otp}`);
    res.json({ msg: "OTP sent to your email" });
});

// 📌 Reset Password using OTP
router.post("/reset", async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });
    if (!newPassword || newPassword.length < 6)
        return res.status(400).json({ msg: "New password must be at least 6 characters" });
    
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ msg: "Password reset successful." });
});

// PATCH: /user/:userId/update-profile
router.patch('/:userId/update-profile', async (req, res) => {
  const { userId } = req.params;
  const { username, bio, newEmail, profilePicture } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });
    if (username) user.username = username;
    if (bio) user.bio = bio;
    if (profilePicture) user.profilePicture = profilePicture;
    await user.save();
    res.json({ success: true, msg: "Profile updated successfully" });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

//Get-otp
router.post('/get-otp', async (req, res) => {
  const { email, newEmail } = req.body;

  try {
    const user = await User.findOne({ email });
    // Only update email if it's different and verified (OTP already validated on frontend)
    if (newEmail && newEmail !== user.email) {
      const existing = await User.findOne({ email: newEmail });
      if (existing) return res.status(409).json({ msg: "Email already in use" });

      user.email = newEmail;
      user.isVerified = false;
    }
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendMail(newEmail, "Email Verification", `Your OTP is: ${otp}`);
    res.json({ msg: "OTP sent to your email" });
  } catch (err) {
    console.error("Get OTP error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

//get user data
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select('-password -otp -otpExpiry -__v ');
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;