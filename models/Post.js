//path: models/Post.js
const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['question', 'poll'], default: 'question' },
  content: String,
  username: { type: String, default: '' }, // For questions
  userProfilePicture: { type: String, default: '' }, // For questions
  imageUrl: { type: String, default: '' },
  correctAnswer: { type: String, default: '' },
  answer: { type: String, default: '' },
  options: [String], // For polls 
  isAnswered: { type: Boolean, default: false },
  tags: [String],
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  createdAt: { type: Date, default: Date.now }
},{ timestamps: true });

module.exports = mongoose.model("Post", PostSchema);
