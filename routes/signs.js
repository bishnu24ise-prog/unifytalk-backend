const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const SignSession = require('../models/SignSession');

// All routes require a valid JWT
router.use(protect);

// POST /api/signs/session — save a new session
router.post('/session', async (req, res, next) => {
  try {
    const { signs = [], label = '', duration = 0 } = req.body;
    const session = await SignSession.create({ user: req.user._id, signs, label, duration });
    res.status(201).json({ success: true, session });
  } catch (err) { next(err); }
});

// GET /api/signs/history — list past sessions (newest first)
router.get('/history', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const sessions = await SignSession.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json({ success: true, sessions });
  } catch (err) { next(err); }
});

// GET /api/signs/stats — aggregate stats for this user
router.get('/stats', async (req, res, next) => {
  try {
    const total = await SignSession.countDocuments({ user: req.user._id });
    const agg = await SignSession.aggregate([
      { $match: { user: req.user._id } },
      { $unwind: { path: '$signs', preserveNullAndEmptyArrays: false } },
      { $group: { _id: '$signs.name', count: { $sum: 1 }, emoji: { $first: '$signs.emoji' }, type: { $first: '$signs.type' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    const totalDurationAgg = await SignSession.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, totalDuration: { $sum: '$duration' } } },
    ]);
    res.json({
      success: true,
      stats: {
        totalSessions: total,
        totalDuration: totalDurationAgg[0]?.totalDuration ?? 0,
        topSigns: agg.map(a => ({ name: a._id, count: a.count, emoji: a.emoji, type: a.type })),
      },
    });
  } catch (err) { next(err); }
});

// DELETE /api/signs/session/:id — remove a session
router.delete('/session/:id', async (req, res, next) => {
  try {
    const session = await SignSession.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
