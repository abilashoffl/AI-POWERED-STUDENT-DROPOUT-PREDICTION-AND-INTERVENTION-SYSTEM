const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  updateStudentProfile,
  requestSupport,
  deleteStudent
} = require('../controllers/studentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getStudents)
  .post(protect, adminOnly, createStudent);

// Student self-service routes
router.put('/profile/me', protect, updateStudentProfile);
router.post('/request-support', protect, requestSupport);

router.route('/:id')
  .get(protect, getStudentById)
  .put(protect, (req, res, next) => {
    // If user is admin, allow full update; if student updating own ID, allow profile update
    if (req.user && req.user.role === 'admin') {
      return updateStudent(req, res, next);
    } else if (req.user && req.user.studentId === req.params.id) {
      return updateStudentProfile(req, res, next);
    } else {
      return res.status(403).json({ message: 'Access denied: Unauthorized to edit this student' });
    }
  })
  .delete(protect, adminOnly, deleteStudent);

module.exports = router;
