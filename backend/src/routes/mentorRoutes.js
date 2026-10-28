const express = require('express');
const router = express.Router();
const { getMentors, createMentor } = require('../controllers/mentorController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getMentors)
  .post(protect, adminOnly, createMentor);

module.exports = router;
