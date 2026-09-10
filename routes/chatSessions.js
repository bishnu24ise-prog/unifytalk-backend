const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const ChatSession = require('../models/ChatSession');

router.use(protect);

// POST /api/chat-sessions — save a session
router.post('/', async (req, res, next) => {
  try {
    const { roomId, roomName, messages, duration, summary } = req.body;
    const session = await ChatSession.create({ user: req.user._id, roomId, roomName, messages, duration, summary });
    res.status(201).json({ success: true, session });
  } catch (err) { next(err); }
});

// GET /api/chat-sessions — list sessions
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const sessions = await ChatSession.find({ user: req.user._id })
      .sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ success: true, sessions });
  } catch (err) { next(err); }
});

// GET /api/chat-sessions/stats
router.get('/stats', async (req, res, next) => {
  try {
    const total = await ChatSession.countDocuments({ user: req.user._id });
    const agg = await ChatSession.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, totalMessages: { $sum: '$messages' }, totalDuration: { $sum: '$duration' } } },
    ]);
    res.json({ success: true, stats: { totalSessions: total, ...agg[0] } });
  } catch (err) { next(err); }
});

// DELETE /api/chat-sessions/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const session = await ChatSession.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
