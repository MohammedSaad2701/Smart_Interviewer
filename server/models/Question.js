const mongoose = require('mongoose');
const QuestionSchema = new mongoose.Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  prompt: String,
  difficulty: { type: Number, default: 3 },
  type: { type: String, enum: ['mcq','coding','short'], default: 'coding' },
  explanation: String
}, { timestamps: true });
module.exports = mongoose.model('Question', QuestionSchema);
