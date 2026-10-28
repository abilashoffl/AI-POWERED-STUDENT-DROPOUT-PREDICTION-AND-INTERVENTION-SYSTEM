const mongoose = require('mongoose');
const Student = require('../models/Student');
const Prediction = require('../models/Prediction');
const Intervention = require('../models/Intervention');
const AcademicRecord = require('../models/AcademicRecord');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { predictDropoutRisk } = require('../services/mlService');
const { generateInterventionRecommendations } = require('../services/interventionRuleEngine');

// Safe student finder that handles ObjectId, studentId, or email without CastError
const findStudent = async (id) => {
  if (!id) return null;
  const isMongoId = mongoose.Types.ObjectId.isValid(id) && String(id).length === 24;
  if (isMongoId) {
    const byId = await Student.findById(id);
    if (byId) return byId;
  }
  return await Student.findOne({
    $or: [{ studentId: id }, { email: id }]
  });
};

// @desc    Get all students (with search, filter, sort)
// @route   GET /api/students
// @access  Private
const getStudents = async (req, res, next) => {
  try {
    const { search, department, riskLevel, year, sortBy, sortOrder } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (riskLevel && riskLevel !== 'All') {
      query.currentRiskLevel = riskLevel;
    }

    if (year && year !== 'All') {
      query.year = Number(year);
    }

    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const students = await Student.find(query).sort(sortOptions);
    res.json(students);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student details with predictions & interventions
// @route   GET /api/students/:id
// @access  Private
const getStudentById = async (req, res, next) => {
  try {
    const student = await findStudent(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const predictions = await Prediction.find({ studentId: student.studentId }).sort({ predictionDate: -1 });
    const interventions = await Intervention.find({ studentId: student.studentId }).sort({ createdAt: -1 });
    const academicRecords = await AcademicRecord.find({ studentId: student.studentId }).sort({ semester: 1 });
    const recommendations = generateInterventionRecommendations(student);

    res.json({
      student,
      predictions,
      interventions,
      academicRecords,
      recommendations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new student
// @route   POST /api/students
// @access  Private/Admin
const createStudent = async (req, res, next) => {
  try {
    const { studentId, email } = req.body;

    const existingStudent = await Student.findOne({ $or: [{ studentId }, { email }] });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this ID or email already exists' });
    }

    // Call ML service to get initial risk prediction
    const mlPrediction = await predictDropoutRisk(req.body);

    const newStudent = new Student({
      ...req.body,
      currentRiskScore: mlPrediction.riskScore,
      currentRiskLevel: mlPrediction.riskLevel,
      currentRiskFactors: mlPrediction.factors
    });

    const savedStudent = await newStudent.save();

    // Save initial Prediction entry
    await Prediction.create({
      studentId: savedStudent.studentId,
      riskScore: mlPrediction.riskScore,
      riskLevel: mlPrediction.riskLevel,
      factors: mlPrediction.factors,
      modelVersion: 'v1.0.0-RandomForest'
    });

    // Create default Academic Records
    await AcademicRecord.create({
      studentId: savedStudent.studentId,
      semester: (savedStudent.year * 2) - 1,
      gpa: savedStudent.currentGpa,
      attendance: savedStudent.attendance,
      backlogs: savedStudent.backlogs,
      internalMarks: savedStudent.internalMarks,
      semesterMarks: savedStudent.semesterMarks,
      assignmentCompletion: savedStudent.assignmentCompletion
    });

    // Also auto-create a user account for the student
    const defaultPassword = 'student123';
    const userExists = await User.findOne({ email: savedStudent.email });
    if (!userExists) {
      await User.create({
        name: savedStudent.name,
        email: savedStudent.email,
        password: defaultPassword,
        role: 'student',
        studentId: savedStudent.studentId
      });
    }

    // If High Risk, generate Admin Notification alert
    if (mlPrediction.riskLevel === 'HIGH') {
      await Notification.create({
        studentId: savedStudent.studentId,
        studentName: savedStudent.name,
        title: 'High Dropout Risk Alert',
        message: `Student ${savedStudent.name} (${savedStudent.studentId}) was added with High Risk (${mlPrediction.riskScore}%).`,
        type: 'risk_alert'
      });
    }

    res.status(201).json(savedStudent);
  } catch (error) {
    next(error);
  }
};

// @desc    Update student profile (by student themselves or admin)
// @route   PUT /api/students/profile/me or PUT /api/students/:id
// @access  Private
const updateStudentProfile = async (req, res, next) => {
  try {
    const studentId = req.user.role === 'student' ? req.user.studentId : (req.params.id || req.user.studentId);
    const student = await findStudent(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // If student is updating themselves, allow updating contact, bio, career goals, etc.
    const allowedFields = req.user.role === 'student'
      ? ['phone', 'email', 'dob', 'bio', 'careerGoal', 'address', 'parentContact']
      : Object.keys(req.body);

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    });

    const updated = await student.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Student requests support/tutoring/mentor meeting
// @route   POST /api/students/request-support
// @access  Private
const requestSupport = async (req, res, next) => {
  try {
    const studentId = req.user.studentId || req.body.studentId;
    const { title, type, reason, preferredDate, mentorName } = req.body;

    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }

    const newIntervention = await Intervention.create({
      studentId: student.studentId,
      title: title || `Support Request: ${type || 'Academic Guidance'}`,
      type: type || 'Academic counselling',
      mentorName: mentorName || 'Assigned Department Mentor',
      priority: 'High',
      description: reason || 'Student submitted self-request for academic assistance.',
      status: 'Pending',
      meetingRequested: true,
      meetingDate: preferredDate ? new Date(preferredDate) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      createdBy: student.name
    });

    // Create Notification for Admin and Faculty
    await Notification.create({
      studentId: student.studentId,
      studentName: student.name,
      title: 'New Student Support Request',
      message: `${student.name} requested support for "${newIntervention.title}".`,
      type: 'intervention_deadline'
    });

    res.status(201).json({
      message: 'Support request submitted successfully! Your mentor has been notified.',
      intervention: newIntervention
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student details (Admin)
// @route   PUT /api/students/:id
// @access  Private/Admin
const updateStudent = async (req, res, next) => {
  try {
    const student = await findStudent(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    Object.assign(student, req.body);

    // Recalculate prediction
    const mlPrediction = await predictDropoutRisk(student);
    student.currentRiskScore = mlPrediction.riskScore;
    student.currentRiskLevel = mlPrediction.riskLevel;
    student.currentRiskFactors = mlPrediction.factors;

    const updatedStudent = await student.save();

    // Log new prediction in history
    await Prediction.create({
      studentId: updatedStudent.studentId,
      riskScore: mlPrediction.riskScore,
      riskLevel: mlPrediction.riskLevel,
      factors: mlPrediction.factors,
      modelVersion: 'v1.0.0-RandomForest'
    });

    if (mlPrediction.riskLevel === 'HIGH') {
      await Notification.create({
        studentId: updatedStudent.studentId,
        studentName: updatedStudent.name,
        title: 'High Dropout Risk Alert',
        message: `Student ${updatedStudent.name} (${updatedStudent.studentId}) risk score escalated to ${mlPrediction.riskScore}%.`,
        type: 'risk_alert'
      });
    }

    res.json(updatedStudent);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student (Admin)
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res, next) => {
  try {
    const student = await findStudent(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await Student.deleteOne({ _id: student._id });
    await Prediction.deleteMany({ studentId: student.studentId });
    await Intervention.deleteMany({ studentId: student.studentId });
    await AcademicRecord.deleteMany({ studentId: student.studentId });
    await User.deleteOne({ studentId: student.studentId });

    res.json({ message: 'Student record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  updateStudentProfile,
  requestSupport,
  deleteStudent
};
