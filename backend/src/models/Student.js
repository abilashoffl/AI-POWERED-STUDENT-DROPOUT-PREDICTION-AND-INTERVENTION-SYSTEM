const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      default: ''
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: ['Computer Science', 'Electronics & Comm', 'Mechanical Eng', 'Civil Eng', 'Information Tech']
    },
    year: {
      type: Number,
      required: [true, 'Academic year is required'],
      min: 1,
      max: 4
    },
    section: {
      type: String,
      default: 'A'
    },
    dob: {
      type: String,
      default: ''
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male'
    },
    attendance: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 75
    },
    currentGpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
      default: 7.0
    },
    previousGpa: {
      type: Number,
      min: 0,
      max: 10,
      default: 7.2
    },
    backlogs: {
      type: Number,
      default: 0,
      min: 0
    },
    assignmentCompletion: {
      type: Number,
      min: 0,
      max: 100,
      default: 80
    },
    internalMarks: {
      type: Number,
      min: 0,
      max: 100,
      default: 75
    },
    semesterMarks: {
      type: Number,
      min: 0,
      max: 100,
      default: 75
    },
    previousAcademicPerformance: {
      type: String,
      default: 'Satisfactory'
    },
    participation: {
      type: Number,
      min: 0,
      max: 100,
      default: 70
    },
    feeStatus: {
      type: Number, // 1: Paid, 0: Pending
      enum: [0, 1],
      default: 1
    },
    parentContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' }
    },
    bio: {
      type: String,
      default: ''
    },
    careerGoal: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    currentRiskScore: {
      type: Number,
      default: 20
    },
    currentRiskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'LOW'
    },
    currentRiskFactors: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
