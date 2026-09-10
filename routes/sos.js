const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const SosAlert = require('../models/SosAlert');

router.use(protect);

// POST /api/sos/alert — create SOS alert
router.post('/alert', async (req, res, next) => {
  try {
    const { message, location, contacts } = req.body;
    const alert = await SosAlert.create({ user: req.user._id, message, location, contacts });
    res.status(201).json({ success: true, alert });
  } catch (err) { next(err); }
});

// GET /api/sos/history — list past alerts
router.get('/history', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const alerts = await SosAlert.find({ user: req.user._id })
      .sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ success: true, alerts });
  } catch (err) { next(err); }
});

module.exports = router;
