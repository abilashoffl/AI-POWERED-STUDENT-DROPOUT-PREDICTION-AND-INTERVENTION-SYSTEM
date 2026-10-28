const Prediction = require('../models/Prediction');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const { predictDropoutRisk } = require('../services/mlService');

// @desc    Generate and save a new prediction for a student
// @route   POST /api/predictions
// @access  Private
const createPrediction = async (req, res, next) => {
  try {
    const { studentId } = req.body;

    let student = null;
    let inputData = req.body;

    if (studentId) {
      student = await Student.findOne({ studentId });
      if (student) {
        inputData = {
          attendance: req.body.attendance ?? student.attendance,
          currentGpa: req.body.currentGpa ?? student.currentGpa,
          previousGpa: req.body.previousGpa ?? student.previousGpa,
          backlogs: req.body.backlogs ?? student.backlogs,
          assignmentCompletion: req.body.assignmentCompletion ?? student.assignmentCompletion,
          internalMarks: req.body.internalMarks ?? student.internalMarks,
          semesterMarks: req.body.semesterMarks ?? student.semesterMarks,
          participation: req.body.participation ?? student.participation,
          feeStatus: req.body.feeStatus ?? student.feeStatus
        };
      }
    }

    const result = await predictDropoutRisk(inputData);

    const newPrediction = await Prediction.create({
      studentId: studentId || 'N/A',
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      factors: result.factors,
      predictionDate: new Date(),
      modelVersion: 'v1.0.0-RandomForest'
    });

    if (student) {
      student.currentRiskScore = result.riskScore;
      student.currentRiskLevel = result.riskLevel;
      student.currentRiskFactors = result.factors;
      await student.save();

      if (result.riskLevel === 'HIGH') {
        await Notification.create({
          studentId: student.studentId,
          studentName: student.name,
          title: 'High Risk Alert Triggered',
          message: `Student ${student.name} risk updated to ${result.riskScore}% (${result.riskLevel}).`,
          type: 'risk_alert'
        });
      }
    }

    res.status(201).json(newPrediction);
  } catch (error) {
    next(error);
  }
};

// @desc    Get prediction history for a specific student
// @route   GET /api/predictions/student/:studentId
// @access  Private
const getPredictionHistoryByStudent = async (req, res, next) => {
  try {
    const predictions = await Prediction.find({ studentId: req.params.studentId }).sort({ predictionDate: 1 });
    res.json(predictions);
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate prediction based on what-if inputs without writing to DB
// @route   POST /api/predictions/simulate
// @access  Private
const simulatePrediction = async (req, res, next) => {
  try {
    const inputData = {
      attendance: Number(req.body.attendance ?? 80),
      currentGpa: Number(req.body.currentGpa ?? 7.0),
      previousGpa: Number(req.body.previousGpa ?? req.body.currentGpa ?? 7.0),
      backlogs: Number(req.body.backlogs ?? 0),
      assignmentCompletion: Number(req.body.assignmentCompletion ?? 80),
      internalMarks: Number(req.body.internalMarks ?? 75),
      semesterMarks: Number(req.body.semesterMarks ?? 75),
      participation: Number(req.body.participation ?? 70),
      feeStatus: Number(req.body.feeStatus ?? 1)
    };

    const result = await predictDropoutRisk(inputData);
    res.json({
      inputs: inputData,
      simulatedRiskScore: result.riskScore,
      simulatedRiskLevel: result.riskLevel,
      simulatedFactors: result.factors,
      modelVersion: 'v1.0.0-RandomForest'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all recent predictions (Admin)
// @route   GET /api/predictions
// @access  Private/Admin
const getAllPredictions = async (req, res, next) => {
  try {
    const predictions = await Prediction.find().sort({ predictionDate: -1 }).limit(100);
    res.json(predictions);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPrediction,
  simulatePrediction,
  getPredictionHistoryByStudent,
  getAllPredictions
};
