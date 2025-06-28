const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  answerIndex: Number
});

module.exports = mongoose.model('Quiz', new mongoose.Schema({
  topicTitle: String,
  questions: [QuestionSchema]
}));