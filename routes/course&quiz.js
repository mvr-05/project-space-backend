const express = require('express');

const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

const router = express.Router();

// ☁ Courses + Levels
router.get('/courses', async (req, res) => {
  const courses = await Course.find({}, 'title levels.levelNumber');
  res.json(courses);
});

router.get('/courses/:courseId/levels/:lvl/topics', async (req, res) => {
  const c = await Course.findById(req.params.courseId);
  const lvl = c.levels.find(l => l.levelNumber == req.params.lvl);
  res.json(lvl.topics.map(t => ({ title: t.title })));
});

router.get('/courses/:id/levels/:lvl/topics/:topicTitle', async (req, res) => {
  const c = await Course.findById(req.params.id);
  const lvl = c.levels.find(l => l.levelNumber == req.params.lvl);
  const t = lvl.topics.find(tt => tt.title === req.params.topicTitle);
  const quiz = await Quiz.findById(t.quizId);
  res.json({ topic: t, quizId: quiz ? quiz._id : null });
});

// 📝 Quiz creation
router.get('/quiz/:quizId', async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId);
  res.json(quiz);
});

// 📈 User streak endpoint
router.post('/user/:userId/quiz-complete', async (req, res) => {
  const user = await User.findById(req.params.userId);
  const today = new Date().setHours(0,0,0,0);
  const last = user.lastQuizDate ? user.lastQuizDate.setHours(0,0,0,0) : null;

  if (last !== today) {
    const yesterday = new Date().setHours(0,0,0,0) - 24*60*60*1000;
    user.streakCount = (last === yesterday) ? user.streakCount + 1 : 1;
    user.lastQuizDate = new Date();
    await user.save();
  }

  res.json({ streak: user.streakCount, lastQuizDate: user.lastQuizDate });
});

// 📝 Quiz submission
router.post('/quiz/:quizId/submit', async (req, res) => {
  const { userId, answers } = req.body;
  const user = await User.findById(userId);
  const quiz = await Quiz.findById(req.params.quizId);

  if (!user || !quiz) {
    return res.status(404).json({ message: 'User or quiz not found' });
  }

  // Check answers and calculate score
  let score = 0;
  quiz.questions.forEach((question, index) => {
    if (question.correctAnswer === answers[index]) {
      score++;
    }
  });

  // Update user progress
  user.progress.push({
    courseId: quiz.courseId,
    levelNumber: quiz.levelNumber,
    completedTopics: quiz.topics.map(t => t.title),
  });
  await user.save();

  res.json({ score });
});

router.post('/user/:userId/complete-topic', async (req, res) => {
  const { courseId, levelNumber, topicTitle } = req.body;
  const user = await User.findById(req.params.userId);

  let progress = user.progress.find(
    p => p.courseId.equals(courseId) && p.levelNumber === levelNumber
  );

  if (!progress) {
    progress = { courseId, levelNumber, completedTopics: [] };
    user.progress.push(progress);
  }

  if (!progress.completedTopics.includes(topicTitle)) {
    progress.completedTopics.push(topicTitle);
    await user.save();
  }

  res.json({ success: true });
});

router.get('/user/:userId/courses/:courseId/levels/:levelNumber/topics', async (req, res) => {
  const { userId, courseId, levelNumber } = req.params;

  const course = await Course.findById(courseId);
  const level = course.levels.find(l => l.levelNumber == levelNumber);
  const user = await User.findById(userId);

  const progress = user.progress.find(
    p => p.courseId.equals(courseId) && p.levelNumber == levelNumber
  );

  const completed = progress ? progress.completedTopics : [];

  // Return topics with lock status
  const topicsWithStatus = level.topics.map((topic, index) => {
    const isCompleted = completed.includes(topic.title);
    const isUnlocked = index === 0 || completed.includes(level.topics[index - 1].title);
    return {
      title: topic.title,
      isCompleted,
      isUnlocked
    };
  });

  res.json(topicsWithStatus);
});

module.exports = router;
