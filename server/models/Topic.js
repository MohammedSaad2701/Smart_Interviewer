const mongoose = require('mongoose');
const TopicSchema = new mongoose.Schema({
  title: String,
  description: String
}, { timestamps: true });
module.exports = mongoose.model('Topic', TopicSchema);
