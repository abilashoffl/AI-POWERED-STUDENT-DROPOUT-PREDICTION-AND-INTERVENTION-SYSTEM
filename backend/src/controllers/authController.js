const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecret_student_dropout_prediction_key_2026', {
    expiresIn: '7d'
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    let studentProfile = null;
    if (user.role === 'student') {
      if (user.studentId) {
        studentProfile = await Student.findOne({ studentId: user.studentId });
      }
      if (!studentProfile) {
        studentProfile = await Student.findOne({ email: user.email });
        if (studentProfile && !user.studentId) {
          user.studentId = studentProfile.studentId;
          await user.save();
        }
      }
    }

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        studentProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public / Admin
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, studentId } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      studentId: studentId || null
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let studentProfile = null;
    if (user.role === 'student') {
      if (user.studentId) {
        studentProfile = await Student.findOne({ studentId: user.studentId });
      }
      if (!studentProfile) {
        studentProfile = await Student.findOne({ email: user.email });
        if (studentProfile && !user.studentId) {
          user.studentId = studentProfile.studentId;
          await user.save();
        }
      }
    }
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        studentProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (currentPassword) {
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user credentials (username/email and/or password)
// @route   PUT /api/auth/update-credentials
// @access  Private
const updateCredentials = async (req, res, next) => {
  try {
    const { email, newPassword, currentPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (currentPassword) {
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'This email is already in use by another account' });
      }
      user.email = email.toLowerCase();
      if (user.studentId) {
        await Student.updateOne({ studentId: user.studentId }, { email: email.toLowerCase() });
      }
    }

    if (newPassword && newPassword.trim()) {
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
      }
      user.password = newPassword;
    }

    await user.save();

    let studentProfile = null;
    if (user.role === 'student' && user.studentId) {
      studentProfile = await Student.findOne({ studentId: user.studentId });
    }

    res.json({
      message: 'Account credentials updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        studentProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { loginUser, registerUser, getMe, updatePassword, updateCredentials };
