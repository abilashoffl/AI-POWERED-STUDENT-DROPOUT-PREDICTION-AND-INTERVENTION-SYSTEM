const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      ref: 'Student'
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    riskLevel: {
      type: String,
      required: true,
      enum: ['LOW', 'MEDIUM', 'HIGH']
    },
    factors: {
      type: [String],
      default: []
    },
    predictionDate: {
      type: Date,
      default: Date.now
    },
    modelVersion: {
      type: String,
      default: 'v1.0.0-RandomForest'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prediction', predictionSchema);
