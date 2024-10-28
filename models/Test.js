const mongoose = require('mongoose');

// Question Schema
const questionSchema = new mongoose.Schema({
    type: { type: String, required: true },
    questionText: { type: String, required: true },
    options: { type: [String], required: function() { return this.type === 'mcq'; } }, // Only required if type is 'mcq'
    correctAnswer: { type: String, required: true }
});

// Test Schema
const testSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    duration: { type: Number, required: true },
    examTimeSpan: { type: Number, required: true },
    questions: [questionSchema], // An array of questionSchema
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true }, // Reference to the Teacher
});

const Test = mongoose.model('Test', testSchema);
module.exports = Test;
