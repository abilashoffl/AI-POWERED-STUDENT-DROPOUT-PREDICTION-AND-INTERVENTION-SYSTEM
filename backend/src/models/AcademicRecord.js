const mongoose = require('mongoose');

const academicRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      ref: 'Student'
    },
    semester: {
      type: Number,
      required: true
    },
    gpa: {
      type: Number,
      required: true
    },
    attendance: {
      type: Number,
      required: true
    },
    backlogs: {
      type: Number,
      default: 0
    },
    internalMarks: {
      type: Number,
      default: 75
    },
    semesterMarks: {
      type: Number,
      default: 75
    },
    assignmentCompletion: {
      type: Number,
      default: 80
    },
    termYear: {
      type: String,
      default: '2025-2026'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AcademicRecord', academicRecordSchema);
