const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const CommunityPost = require('../models/CommunityPost');

router.use(protect);

// GET /api/community — list posts (newest first, optional ?tag=)
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.tag) filter.tags = req.query.tag;
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    const posts = await CommunityPost.find(filter)
      .populate('user', 'name avatar')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit)
      .lean();
    // Add likeCount and whether current user liked it
    const userId = String(req.user._id);
    const mapped = posts.map(p => ({
      ...p,
      likeCount: p.likes.length,
      likedByMe: p.likes.some(id => String(id) === userId),
      likes: undefined,
    }));
    res.json({ success: true, posts: mapped });
  } catch (err) { next(err); }
});

// POST /api/community — create a post
router.post('/', async (req, res, next) => {
  try {
    const { text, imageUrl, tags } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });
    const post = await CommunityPost.create({ user: req.user._id, text, imageUrl, tags });
    await post.populate('user', 'name avatar');
    res.status(201).json({ success: true, post });
  } catch (err) { next(err); }
});

// POST /api/community/:id/like — toggle like
router.post('/:id/like', async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const userId = req.user._id;
    const alreadyLiked = post.likes.some(id => String(id) === String(userId));
    if (alreadyLiked) {
      post.likes = post.likes.filter(id => String(id) !== String(userId));
    } else {
      post.likes.push(userId);
    }
    await post.save();
    res.json({ success: true, likeCount: post.likes.length, likedByMe: !alreadyLiked });
  } catch (err) { next(err); }
});

// DELETE /api/community/:id — owner can delete
router.delete('/:id', async (req, res, next) => {
  try {
    const post = await CommunityPost.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!post) return res.status(404).json({ error: 'Post not found or not yours' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
