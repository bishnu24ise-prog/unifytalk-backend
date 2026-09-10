const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const AccessibilityPref = require('../models/AccessibilityPref');

router.use(protect);

// GET /api/accessibility/prefs
router.get('/prefs', async (req, res, next) => {
  try {
    let prefs = await AccessibilityPref.findOne({ user: req.user._id }).lean();
    if (!prefs) {
      // Return defaults without persisting until the user actually saves
      prefs = {
        fontSize: 'medium', highContrast: false, reduceMotion: false,
        screenReader: false, voiceEnabled: false, language: 'en',
      };
    }
    res.json({ success: true, prefs });
  } catch (err) { next(err); }
});

// PUT /api/accessibility/prefs
router.put('/prefs', async (req, res, next) => {
  try {
    const allowed = ['fontSize', 'highContrast', 'reduceMotion', 'screenReader', 'voiceEnabled', 'language'];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    const prefs = await AccessibilityPref.findOneAndUpdate(
      { user: req.user._id },
      { $set: update },
      { new: true, upsert: true }
    );
    res.json({ success: true, prefs });
  } catch (err) { next(err); }
});

// POST /api/accessibility/voice-log
router.post('/voice-log', async (req, res, next) => {
  try {
    const { command, recognized = true, action = '' } = req.body;
    await AccessibilityPref.findOneAndUpdate(
      { user: req.user._id },
      { $push: { voiceLogs: { command, recognized, action, at: new Date() } } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

// GET /api/accessibility/voice-stats
router.get('/voice-stats', async (req, res, next) => {
  try {
    const doc = await AccessibilityPref.findOne({ user: req.user._id }).lean();
    const logs = doc?.voiceLogs || [];
    const total = logs.length;
    const recognized = logs.filter(l => l.recognized).length;
    const topCommands = Object.entries(
      logs.reduce((acc, l) => { acc[l.command] = (acc[l.command] || 0) + 1; return acc; }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([command, count]) => ({ command, count }));
    res.json({ success: true, stats: { total, recognized, topCommands } });
  } catch (err) { next(err); }
});

module.exports = router;
