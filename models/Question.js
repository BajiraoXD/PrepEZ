// models/Question.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['text', 'mcq'], // or include 'msq' for multiple select questions
        required: true,
    },
    questionText: {
        type: String,
        required: true,
    },
    correctAnswer: {
        type: mongoose.Schema.Types.Mixed, // This can be String or Number depending on question type
        required: true,
    },
    options: [{
        type: String, // For MCQ options
    }],
    test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
