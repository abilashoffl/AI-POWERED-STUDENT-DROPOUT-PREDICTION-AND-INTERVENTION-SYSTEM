const Student = require('../models/Student');
const Intervention = require('../models/Intervention');
const Prediction = require('../models/Prediction');

// @desc    Get top-level dashboard metrics overview
// @route   GET /api/analytics/overview
// @access  Private/Admin
const getOverview = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const highRiskCount = await Student.countDocuments({ currentRiskLevel: 'HIGH' });
    const mediumRiskCount = await Student.countDocuments({ currentRiskLevel: 'MEDIUM' });
    const lowRiskCount = await Student.countDocuments({ currentRiskLevel: 'LOW' });
    
    const activeInterventions = await Intervention.countDocuments({ status: { $in: ['Pending', 'In Progress'] } });
    const completedInterventions = await Intervention.countDocuments({ status: 'Completed' });
    const totalInterventions = await Intervention.countDocuments();

    // Students requiring urgent attention: High risk OR attendance < 60% OR backlogs >= 3
    const studentsRequiringAttention = await Student.countDocuments({
      $or: [
        { currentRiskLevel: 'HIGH' },
        { attendance: { $lt: 60 } },
        { backlogs: { $gte: 3 } }
      ]
    });

    res.json({
      totalStudents,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      activeInterventions,
      completedInterventions,
      totalInterventions,
      studentsRequiringAttention,
      interventionCompletionRate: totalInterventions > 0 ? Math.round((completedInterventions / totalInterventions) * 100) : 0
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed risk distribution and scatter chart analytics
// @route   GET /api/analytics/risk
// @access  Private/Admin
const getRiskStats = async (req, res, next) => {
  try {
    const students = await Student.find().select('studentId name department year attendance currentGpa backlogs currentRiskScore currentRiskLevel');

    const riskDistribution = [
      { name: 'Low Risk', value: students.filter(s => s.currentRiskLevel === 'LOW').length, color: '#10B981' },
      { name: 'Medium Risk', value: students.filter(s => s.currentRiskLevel === 'MEDIUM').length, color: '#F59E0B' },
      { name: 'High Risk', value: students.filter(s => s.currentRiskLevel === 'HIGH').length, color: '#EF4444' }
    ];

    const attendanceVsRisk = students.map(s => ({
      studentId: s.studentId,
      name: s.name,
      attendance: s.attendance,
      riskScore: s.currentRiskScore,
      riskLevel: s.currentRiskLevel
    }));

    const gpaVsRisk = students.map(s => ({
      studentId: s.studentId,
      name: s.name,
      gpa: s.currentGpa,
      riskScore: s.currentRiskScore,
      riskLevel: s.currentRiskLevel
    }));

    const backlogRanges = [
      { category: '0 Backlogs', count: students.filter(s => s.backlogs === 0).length },
      { category: '1 Backlog', count: students.filter(s => s.backlogs === 1).length },
      { category: '2 Backlogs', count: students.filter(s => s.backlogs === 2).length },
      { category: '3+ Backlogs', count: students.filter(s => s.backlogs >= 3).length }
    ];

    res.json({
      riskDistribution,
      attendanceVsRisk,
      gpaVsRisk,
      backlogRanges
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get department-wise analytics
// @route   GET /api/analytics/departments
// @access  Private/Admin
const getDepartmentStats = async (req, res, next) => {
  try {
    const departments = ['Computer Science', 'Electronics & Comm', 'Mechanical Eng', 'Civil Eng', 'Information Tech'];
    const result = [];

    for (const dept of departments) {
      const deptStudents = await Student.find({ department: dept });
      const total = deptStudents.length;

      if (total === 0) {
        result.push({ department: dept, total: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0, avgGpa: 0, avgAttendance: 0 });
        continue;
      }

      const highRisk = deptStudents.filter(s => s.currentRiskLevel === 'HIGH').length;
      const mediumRisk = deptStudents.filter(s => s.currentRiskLevel === 'MEDIUM').length;
      const lowRisk = deptStudents.filter(s => s.currentRiskLevel === 'LOW').length;

      const avgGpa = deptStudents.reduce((sum, s) => sum + s.currentGpa, 0) / total;
      const avgAttendance = deptStudents.reduce((sum, s) => sum + s.attendance, 0) / total;

      result.push({
        department: dept,
        total,
        highRisk,
        mediumRisk,
        lowRisk,
        avgGpa: Number(avgGpa.toFixed(2)),
        avgAttendance: Number(avgAttendance.toFixed(1))
      });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getRiskStats,
  getDepartmentStats
};
