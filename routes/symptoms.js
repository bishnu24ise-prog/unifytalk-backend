const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const SymptomReport = require('../models/SymptomReport');

router.use(protect);

// POST /api/symptoms/report
router.post('/report', async (req, res, next) => {
  try {
    const { symptoms, severity, bodyPart, notes, duration } = req.body;
    const report = await SymptomReport.create({ user: req.user._id, symptoms, severity, bodyPart, notes, duration });
    res.status(201).json({ success: true, report });
  } catch (err) { next(err); }
});

// GET /api/symptoms/history
router.get('/history', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const reports = await SymptomReport.find({ user: req.user._id })
      .sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ success: true, reports });
  } catch (err) { next(err); }
});

// GET /api/symptoms/stats
router.get('/stats', async (req, res, next) => {
  try {
    const total = await SymptomReport.countDocuments({ user: req.user._id });
    const agg = await SymptomReport.aggregate([
      { $match: { user: req.user._id } },
      { $unwind: { path: '$symptoms', preserveNullAndEmptyArrays: false } },
      { $group: { _id: '$symptoms', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 10 },
    ]);
    const avgSeverity = await SymptomReport.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, avg: { $avg: '$severity' } } },
    ]);
    res.json({
      success: true,
      stats: {
        totalReports: total,
        avgSeverity: avgSeverity[0]?.avg?.toFixed(1) ?? null,
        topSymptoms: agg.map(a => ({ name: a._id, count: a.count })),
      },
    });
  } catch (err) { next(err); }
});

module.exports = router;
