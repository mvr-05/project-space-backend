const Comment = require('../models/Comment');
const Post = require('../models/Post');

exports.addComment = async (req, res) => {
  try {
    const newComment = new Comment({
      content: req.body.content,
      postId: req.params.postId,
      user: req.user.id
    });

    await newComment.save();
    await Post.findByIdAndUpdate(req.params.postId, { $push: { comments: newComment._id } });

    const io = req.app.get('io');
    io.emit('new_comment', newComment); // Emit new comment globally

    res.status(200).json(newComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

exports.getCommentsForPost = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).populate("user");

    const io = req.app.get('io');
    io.emit('comments_fetched', {
      postId: req.params.postId,
      count: comments.length
    }); // Optional emit

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};
