const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    department: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      default: ''
    },
    designation: {
      type: String,
      default: 'Assistant Professor'
    },
    activeInterventionsCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Mentor', mentorSchema);
