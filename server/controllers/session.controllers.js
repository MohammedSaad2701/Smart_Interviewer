const Session = require('../models/Session');
const Question = require('../models/Question');
const Topic = require('../models/Topic');


// Create a new session for a topic (selects 2 random questions)
exports.createSession = async (req, res, next) => {
  try {
    const { topicId, candidateId } = req.body;
    const qs = await Question.find({ topicId }).lean();
    if (!qs.length) return res.status(400).json({ error: 'No questions for topic' });
    // shuffle
    qs.sort(() => 0.5 - Math.random());
    const selected = qs.slice(0, 2);
    const questionIds = selected.map(q => q._id);
    const session = await Session.create({
      topicId,
      questionIds,
      questions: questionIds.map(qid => ({ questionId: qid })),
      candidate: candidateId
    });
    res.json({ session });
  } catch (e) { next(e); }
};

// Start a session (mark as started)
exports.startSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    session.status = 'started';
    session.sessionStart = new Date();
    await session.save();
    res.json({ session });
  } catch (e) { next(e); }
};

// Get a session by ID
exports.getSession = async (req, res, next) => {
  try {
    const s = await Session.findById(req.params.id).populate('questions.questionId').lean();
    if (!s) return res.status(404).json({ error: 'Session not found' });
    res.json({ session: s });
  } catch (e) { next(e); }
};

// Export all session controller functions
