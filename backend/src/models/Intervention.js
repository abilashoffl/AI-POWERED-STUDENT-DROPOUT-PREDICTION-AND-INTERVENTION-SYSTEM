const mongoose = require('mongoose');

const interventionSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      ref: 'Student'
    },
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: [
        'Academic counselling',
        'Faculty mentoring',
        'Remedial classes',
        'Attendance monitoring',
        'Assignment support',
        'Peer mentoring',
        'Parent/guardian meeting',
        'Financial guidance',
        'Career counselling'
      ]
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mentor',
      default: null
    },
    mentorName: {
      type: String,
      default: 'Unassigned'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    deadline: {
      type: Date,
      default: null
    },
    createdBy: {
      type: String,
      default: 'System Admin'
    },
    studentNotes: {
      type: String,
      default: ''
    },
    studentAcknowledged: {
      type: Boolean,
      default: false
    },
    meetingRequested: {
      type: Boolean,
      default: false
    },
    meetingDate: {
      type: Date,
      default: null
    },
    meetingNotes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Intervention', interventionSchema);
