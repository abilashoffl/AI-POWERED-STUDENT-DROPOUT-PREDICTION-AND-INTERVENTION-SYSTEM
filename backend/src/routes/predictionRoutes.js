const express = require('express');
const router = express.Router();
const {
  createPrediction,
  simulatePrediction,
  getPredictionHistoryByStudent,
  getAllPredictions
} = require('../controllers/predictionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createPrediction)
  .get(protect, adminOnly, getAllPredictions);

router.post('/simulate', protect, simulatePrediction);
router.get('/student/:studentId', protect, getPredictionHistoryByStudent);

module.exports = router;
