const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const Phrase = require('../models/Phrase');

router.use(protect);

// GET /api/phrases — list all phrases for user
router.get('/', async (req, res, next) => {
  try {
    const phrases = await Phrase.find({ user: req.user._id }).sort({ useCount: -1, createdAt: -1 }).lean();
    res.json({ success: true, phrases });
  } catch (err) { next(err); }
});

// POST /api/phrases — create a phrase
router.post('/', async (req, res, next) => {
  try {
    const { text, category, emoji } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });
    const phrase = await Phrase.create({ user: req.user._id, text, category, emoji });
    res.status(201).json({ success: true, phrase });
  } catch (err) { next(err); }
});

// PATCH /api/phrases/:id/use — increment use count
router.patch('/:id/use', async (req, res, next) => {
  try {
    const phrase = await Phrase.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $inc: { useCount: 1 }, $set: { lastUsed: new Date() } },
      { new: true }
    );
    if (!phrase) return res.status(404).json({ error: 'Phrase not found' });
    res.json({ success: true, phrase });
  } catch (err) { next(err); }
});

// DELETE /api/phrases/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const phrase = await Phrase.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!phrase) return res.status(404).json({ error: 'Phrase not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
