const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: String,
  youtubeUrl: String,
  description: String,
  sampleCode: String,
  quizId: { type: mongoose.ObjectId, ref: 'Quiz' }
});

const LevelSchema = new mongoose.Schema({
  title: String,
  levelNumber: Number,
  topics: [VideoSchema]
});

const CourseSchema = new mongoose.Schema({
  title: String,
  levels: [LevelSchema]
});

module.exports = mongoose.model('Course', CourseSchema);