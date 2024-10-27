const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    teacherID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true, // Ensure this is required
        ref: 'Teacher'   // Optional: Reference to Teacher model
    },
    Name: { type: String, required: true },
    Date: { type: Date, required: true },
    Time: { type: String, required: true },
    roomid: { type: String, required: true }
});

module.exports = mongoose.model('Interview', interviewSchema);
