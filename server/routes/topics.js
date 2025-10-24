const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');
const Question = require('../models/Question');

// list topics
router.get('/', async (req, res, next) => {
  try {
    const topics = await Topic.find().lean();
    const mapped = topics.map(t => ({
      id: t._id,
      name: t.title || t.name || 'Topic',
      description: t.description || ''
    }));
    res.json({ topics: mapped });
  } catch (e) { next(e); }
});

// get single
router.get('/:id', async (req, res, next) => {
  try {
    const topic = await Topic.findById(req.params.id).lean();
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    res.json({ topic });
  } catch (e) { next(e); }
});

// add topic
router.post('/', async (req, res, next) => {
  try {
    const topic = await Topic.create(req.body);
    res.json({ topic });
  } catch (e) { next(e); }
});

// add question to topic
router.post('/:id/questions', async (req, res, next) => {
  try {
    const question = await Question.create({ topicId: req.params.id, ...req.body });
    res.json({ question });
  } catch (e) { next(e); }
});

module.exports = router;
