const mongoose = require('mongoose');

const QuestionEntry = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  approachRecording: { type: mongoose.Schema.Types.ObjectId, ref: 'AudioRecord' },
  codingRecording: { type: mongoose.Schema.Types.ObjectId, ref: 'AudioRecord' },
  questionStatus: { type: String, enum: ['not_started','in_progress','skipped','completed','failed'], default: 'not_started' }
}, { _id: false });

const SessionSchema = new mongoose.Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  questions: [QuestionEntry],
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['waiting','started','ended'], default: 'waiting' },
  currentQuestionIndex: { type: Number, default: 0 },
  sessionStart: Date,
  sessionEnd: Date,
  totalTimeLimitSec: { type: Number, default: 3600 }
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);
