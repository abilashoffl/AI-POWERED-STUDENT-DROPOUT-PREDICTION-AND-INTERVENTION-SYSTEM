const Mentor = require('../models/Mentor');

// @desc    Get all mentors
// @route   GET /api/mentors
// @access  Private
const getMentors = async (req, res, next) => {
  try {
    const mentors = await Mentor.find().sort({ name: 1 });
    res.json(mentors);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a mentor
// @route   POST /api/mentors
// @access  Private/Admin
const createMentor = async (req, res, next) => {
  try {
    const { name, email, department, phone, designation } = req.body;

    const existingMentor = await Mentor.findOne({ email });
    if (existingMentor) {
      return res.status(400).json({ message: 'Mentor with this email already exists' });
    }

    const mentor = await Mentor.create({
      name,
      email,
      department,
      phone: phone || '',
      designation: designation || 'Assistant Professor'
    });

    res.status(201).json(mentor);
  } catch (error) {
    next(error);
  }
};

module.exports = { getMentors, createMentor };
