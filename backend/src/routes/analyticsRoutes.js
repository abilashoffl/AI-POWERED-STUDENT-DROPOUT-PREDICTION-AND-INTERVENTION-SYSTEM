const express = require('express');
const router = express.Router();
const {
  getOverview,
  getRiskStats,
  getDepartmentStats
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/overview', protect, getOverview);
router.get('/risk', protect, getRiskStats);
router.get('/departments', protect, getDepartmentStats);

module.exports = router;
