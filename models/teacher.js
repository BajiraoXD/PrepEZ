const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({  // Use consistent naming
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  googleId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Check if the model is already compiled to prevent the OverwriteModelError
const Teachers = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;
