const mongoose = require("mongoose");

const UserProgressSchema = new mongoose.Schema({
  courseId: mongoose.ObjectId,
  levelNumber: Number,
  completedTopics: [String], // topic titles
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    otp: String,
    otpExpiry: Date,
    createdAt: { type: Date, default: Date.now },
    profilePicture: { type: String, default: "" },
    streakCount: { type: Number, default: 0 },
    lastQuizDate: Date,
    progress: [UserProgressSchema],
    bio : { type: String, default: "" },
});

module.exports = mongoose.model("User", userSchema,);
module.exports.UserProgressSchema = UserProgressSchema;
// This model defines the structure of a User document in MongoDB.
