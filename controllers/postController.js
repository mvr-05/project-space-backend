//file: controllers/postController.js
const Post = require('../models/Post');
const User = require('../models/User');

exports.createPost = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const newPost = new Post({
      user: user._id,
      type: req.body.type,
      content: req.body.content,
      imageUrl: req.body.imageUrl || '',
      options: req.body.options || [],
      correctAnswer: req.body.correctAnswer || '',
      isAnswered: req.body.isAnswered || false,
      answer: req.body.answer || '',
      tags: req.body.tags || [],
    });
    const savedPost = await newPost.save();
    const populatedPost = await savedPost.populate('user', 'username profilePicture');
    const io = req.app.get('io');
    io.emit('new_post', populatedPost);

    res.status(200).json(populatedPost);
  } catch (error) {
    console.error("❌ Error in createPost:", error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

exports.likePost = async (req, res) => {
  try {
    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    const io = req.app.get('io');
    io.emit('like_updated', { postId: updated._id, likes: updated.likes }); // Emit like update

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Like failed' });
  }
};

exports.viewPost = async (req, res) => {
  try {
    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    const io = req.app.get('io');
    io.emit('view_updated', { postId: updated._id, views: updated.views }); // Emit view update

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'View increment failed' });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const type = req.query.type;
    const posts = await Post.find(type ? { type } : {})
      .sort({ createdAt: -1 })
      .populate("user", "username profilePicture");

    const io = req.app.get('io');
    io.emit('posts_fetched', { count: posts.length }); // Emit posts fetched summary (optional)

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

const getAllPostsOfUser = async (req, res) => {
  try {
    const { type, user } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (user) filter.user = user;

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", "username profilePicture");

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};
exports.getAllPostsOfUser = getAllPostsOfUser;