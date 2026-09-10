const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Curated phrase suggestions keyed by context
const SUGGESTIONS = {
  pain:     ['I am in pain', 'It hurts here', 'I need medicine', 'Call a doctor'],
  greeting: ['Hello, nice to meet you', 'Good morning', 'How are you?', 'See you later'],
  help:     ['I need help', 'Please assist me', 'Can you call someone?', 'Thank you'],
  food:     ['I am hungry', 'I am thirsty', 'I would like water', 'Can I have food?'],
  default:  [
    'How are you doing today?', 
    'Could you help me with something?', 
    'I need a moment, please.', 
    'Thank you so much for your patience.', 
    'Can we talk about this later?', 
    'I agree with you completely.'
  ],
};

// POST /api/smart-phrases/suggest
router.post('/suggest', async (req, res, next) => {
  try {
    const { context = '' } = req.body;
    const key = Object.keys(SUGGESTIONS).find(k => context.toLowerCase().includes(k)) || 'default';
    res.json({ success: true, suggestions: SUGGESTIONS[key] });
  } catch (err) { next(err); }
});

module.exports = router;
