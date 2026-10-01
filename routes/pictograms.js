const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const PictogramSession = require('../models/PictogramSession');

router.use(protect);

// POST /api/pictograms/session
router.post('/session', async (req, res, next) => {
  try {
    const { board = [], sentence = '', language = 'en', duration = 0 } = req.body;
    const session = await PictogramSession.create({ user: req.user._id, board, sentence, language, duration });
    res.status(201).json({ success: true, session });
  } catch (err) { next(err); }
});

// GET /api/pictograms/history
router.get('/history', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const sessions = await PictogramSession.find({ user: req.user._id })
      .sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ success: true, sessions });
  } catch (err) { next(err); }
});

// GET /api/pictograms/stats
router.get('/stats', async (req, res, next) => {
  try {
    const total = await PictogramSession.countDocuments({ user: req.user._id });
    const agg = await PictogramSession.aggregate([
      { $match: { user: req.user._id } },
      { $unwind: { path: '$board', preserveNullAndEmptyArrays: false } },
      { $group: { _id: '$board.label', count: { $sum: 1 }, emoji: { $first: '$board.emoji' } } },
      { $sort: { count: -1 } }, { $limit: 10 },
    ]);
    res.json({
      success: true,
      stats: {
        totalSessions: total,
        topPictograms: agg.map(a => ({ label: a._id, count: a.count, emoji: a.emoji })),
      },
    });
  } catch (err) { next(err); }
});

// DELETE /api/pictograms/session/:id
router.delete('/session/:id', async (req, res, next) => {
  try {
    const session = await PictogramSession.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
