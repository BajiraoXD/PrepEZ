
const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answer: [Number], // for MCQ/MSQ, otherwise just a single entry for text
  isCorrect: Boolean,
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Answer', answerSchema);
