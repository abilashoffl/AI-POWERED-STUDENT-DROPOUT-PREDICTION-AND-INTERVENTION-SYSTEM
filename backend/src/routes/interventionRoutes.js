const express = require('express');
const router = express.Router();
const {
  getInterventions,
  createIntervention,
  updateIntervention,
  studentInterventionAction,
  deleteIntervention
} = require('../controllers/interventionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getInterventions)
  .post(protect, createIntervention);

router.put('/:id/student-action', protect, studentInterventionAction);

router.route('/:id')
  .put(protect, updateIntervention)
  .delete(protect, adminOnly, deleteIntervention);

module.exports = router;
