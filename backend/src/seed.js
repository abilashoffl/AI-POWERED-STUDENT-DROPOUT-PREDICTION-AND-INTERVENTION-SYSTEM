const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Student = require('./models/Student');
const Prediction = require('./models/Prediction');
const Intervention = require('./models/Intervention');
const Mentor = require('./models/Mentor');
const Notification = require('./models/Notification');
const AcademicRecord = require('./models/AcademicRecord');

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Student.deleteMany({});
    await Prediction.deleteMany({});
    await Intervention.deleteMany({});
    await Mentor.deleteMany({});
    await Notification.deleteMany({});
    await AcademicRecord.deleteMany({});

    console.log('[Seed] Creating demo mentors...');
    const mentors = await Mentor.insertMany([
      { name: 'Dr. Alan Turing', email: 'turing@college.edu', department: 'Computer Science', phone: '+1-555-0101', designation: 'Professor & Head', activeInterventionsCount: 2 },
      { name: 'Dr. Grace Hopper', email: 'hopper@college.edu', department: 'Computer Science', phone: '+1-555-0102', designation: 'Associate Professor', activeInterventionsCount: 1 },
      { name: 'Prof. Richard Feynman', email: 'feynman@college.edu', department: 'Electronics & Comm', phone: '+1-555-0103', designation: 'Professor', activeInterventionsCount: 1 },
      { name: 'Dr. Ada Lovelace', email: 'lovelace@college.edu', department: 'Information Tech', phone: '+1-555-0104', designation: 'Assistant Professor', activeInterventionsCount: 0 },
      { name: 'Prof. Nikola Tesla', email: 'tesla@college.edu', department: 'Mechanical Eng', phone: '+1-555-0105', designation: 'Professor', activeInterventionsCount: 1 }
    ]);

    console.log('[Seed] Creating Admin account...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@college.edu',
      password: 'admin123',
      role: 'admin'
    });

    console.log('[Seed] Creating Demo Students & Accounts...');
    const studentList = [
      {
        studentId: 'ST1001',
        name: 'Alex Vance',
        email: 'alex.vance@student.college.edu',
        phone: '+1-555-0201',
        department: 'Computer Science',
        year: 4,
        section: 'A',
        dob: '2004-03-15',
        gender: 'Male',
        attendance: 45,
        currentGpa: 4.8,
        previousGpa: 5.6,
        backlogs: 4,
        assignmentCompletion: 38,
        internalMarks: 42,
        semesterMarks: 45,
        previousAcademicPerformance: 'Declining',
        participation: 25,
        feeStatus: 0,
        parentContact: { name: 'Robert Vance', phone: '+1-555-0301', email: 'robert.vance@gmail.com' },
        currentRiskScore: 88,
        currentRiskLevel: 'HIGH',
        currentRiskFactors: ['Low attendance percentage (<65%)', 'Critical backlog count (3 or more)', 'Low assignment completion (<50%)', 'Low academic GPA (<5.5)', 'Pending tuition fee payment']
      },
      {
        studentId: 'ST1002',
        name: 'Sophia Martinez',
        email: 'sophia.m@student.college.edu',
        phone: '+1-555-0202',
        department: 'Information Tech',
        year: 3,
        section: 'B',
        dob: '2004-07-22',
        gender: 'Female',
        attendance: 58,
        currentGpa: 5.4,
        previousGpa: 6.2,
        backlogs: 2,
        assignmentCompletion: 52,
        internalMarks: 50,
        semesterMarks: 53,
        previousAcademicPerformance: 'Needs Improvement',
        participation: 45,
        feeStatus: 1,
        parentContact: { name: 'Maria Martinez', phone: '+1-555-0302', email: 'maria.m@gmail.com' },
        currentRiskScore: 74,
        currentRiskLevel: 'HIGH',
        currentRiskFactors: ['Low attendance percentage (<65%)', 'Active academic backlogs', 'Declining GPA trend', 'Poor performance in internal assessments']
      },
      {
        studentId: 'ST1003',
        name: 'Marcus Chen',
        email: 'marcus.c@student.college.edu',
        phone: '+1-555-0203',
        department: 'Electronics & Comm',
        year: 2,
        section: 'A',
        dob: '2005-11-05',
        gender: 'Male',
        attendance: 72,
        currentGpa: 6.5,
        previousGpa: 6.8,
        backlogs: 1,
        assignmentCompletion: 70,
        internalMarks: 65,
        semesterMarks: 68,
        previousAcademicPerformance: 'Average',
        participation: 60,
        feeStatus: 1,
        parentContact: { name: 'David Chen', phone: '+1-555-0303', email: 'david.chen@gmail.com' },
        currentRiskScore: 48,
        currentRiskLevel: 'MEDIUM',
        currentRiskFactors: ['Moderate attendance deficit (<75%)', 'Active academic backlogs']
      },
      {
        studentId: 'ST1004',
        name: 'Emily Watson',
        email: 'emily.w@student.college.edu',
        phone: '+1-555-0204',
        department: 'Computer Science',
        year: 3,
        section: 'A',
        dob: '2004-09-12',
        gender: 'Female',
        attendance: 92,
        currentGpa: 8.9,
        previousGpa: 8.7,
        backlogs: 0,
        assignmentCompletion: 95,
        internalMarks: 90,
        semesterMarks: 88,
        previousAcademicPerformance: 'Excellent',
        participation: 88,
        feeStatus: 1,
        parentContact: { name: 'John Watson', phone: '+1-555-0304', email: 'john.watson@gmail.com' },
        currentRiskScore: 12,
        currentRiskLevel: 'LOW',
        currentRiskFactors: ['Satisfactory academic progress & attendance']
      },
      {
        studentId: 'ST1005',
        name: 'David Kim',
        email: 'david.kim@student.college.edu',
        phone: '+1-555-0205',
        department: 'Mechanical Eng',
        year: 4,
        section: 'B',
        dob: '2003-12-01',
        gender: 'Male',
        attendance: 62,
        currentGpa: 5.9,
        previousGpa: 6.5,
        backlogs: 2,
        assignmentCompletion: 55,
        internalMarks: 58,
        semesterMarks: 60,
        previousAcademicPerformance: 'Below Average',
        participation: 50,
        feeStatus: 0,
        parentContact: { name: 'Sun Kim', phone: '+1-555-0305', email: 'sun.kim@gmail.com' },
        currentRiskScore: 66,
        currentRiskLevel: 'MEDIUM',
        currentRiskFactors: ['Low attendance percentage (<65%)', 'Active academic backlogs', 'Declining GPA trend', 'Pending tuition fee payment']
      },
      {
        studentId: 'ST1006',
        name: 'Jessica Taylor',
        email: 'jessica.t@student.college.edu',
        phone: '+1-555-0206',
        department: 'Civil Eng',
        year: 1,
        section: 'A',
        dob: '2006-04-18',
        gender: 'Female',
        attendance: 95,
        currentGpa: 9.4,
        previousGpa: 9.2,
        backlogs: 0,
        assignmentCompletion: 98,
        internalMarks: 94,
        semesterMarks: 92,
        previousAcademicPerformance: 'Outstanding',
        participation: 92,
        feeStatus: 1,
        parentContact: { name: 'Sarah Taylor', phone: '+1-555-0306', email: 'sarah.taylor@gmail.com' },
        currentRiskScore: 8,
        currentRiskLevel: 'LOW',
        currentRiskFactors: ['Satisfactory academic progress & attendance']
      }
    ];

    const createdStudents = await Student.insertMany(studentList);

    // Create user accounts for each student
    for (const student of createdStudents) {
      await User.create({
        name: student.name,
        email: student.email,
        password: 'student123',
        role: 'student',
        studentId: student.studentId
      });

      // Seed historical prediction trajectory for trends
      const months = ['January', 'February', 'March', 'April'];
      const baseRisk = student.currentRiskScore;
      months.forEach((month, idx) => {
        const monthOffset = (4 - idx) * 30 * 24 * 60 * 60 * 1000;
        const historicalScore = Math.max(5, Math.min(95, baseRisk + (idx - 3) * 6));
        Prediction.create({
          studentId: student.studentId,
          riskScore: historicalScore,
          riskLevel: historicalScore >= 70 ? 'HIGH' : historicalScore >= 40 ? 'MEDIUM' : 'LOW',
          factors: student.currentRiskFactors,
          predictionDate: new Date(Date.now() - monthOffset),
          modelVersion: 'v1.0.0-RandomForest'
        });
      });

      // Seed Academic Records
      await AcademicRecord.create({
        studentId: student.studentId,
        semester: (student.year * 2) - 1,
        gpa: student.currentGpa,
        attendance: student.attendance,
        backlogs: student.backlogs,
        internalMarks: student.internalMarks,
        semesterMarks: student.semesterMarks,
        assignmentCompletion: student.assignmentCompletion
      });
    }

    console.log('[Seed] Creating Interventions...');
    await Intervention.insertMany([
      {
        studentId: 'ST1001',
        title: 'Comprehensive Academic Counselling & Remedial Classes',
        type: 'Academic counselling',
        mentorId: mentors[0]._id,
        mentorName: mentors[0].name,
        priority: 'Urgent',
        description: 'Student has 4 backlogs and 45% attendance. Weekly mandatory counseling and catch-up classes scheduled.',
        status: 'In Progress',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdBy: 'System Admin'
      },
      {
        studentId: 'ST1001',
        title: 'Attendance Monitoring & Parent Conference',
        type: 'Attendance monitoring',
        mentorId: mentors[1]._id,
        mentorName: mentors[1].name,
        priority: 'High',
        description: 'Daily biometric attendance check-in required. Parent updated via email.',
        status: 'Pending',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdBy: 'System Admin'
      },
      {
        studentId: 'ST1002',
        title: 'Faculty Mentorship & Assignment Assistance',
        type: 'Faculty mentoring',
        mentorId: mentors[2]._id,
        mentorName: mentors[2].name,
        priority: 'High',
        description: 'Bi-weekly faculty check-ins to review coursework submission and exam preparation.',
        status: 'In Progress',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        createdBy: 'System Admin'
      },
      {
        studentId: 'ST1005',
        title: 'Financial Aid Advisory & Scholarship Support',
        type: 'Financial guidance',
        mentorId: mentors[4]._id,
        mentorName: mentors[4].name,
        priority: 'Medium',
        description: 'Assisting student with fee installment application and institutional scholarship forms.',
        status: 'Completed',
        deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdBy: 'System Admin'
      }
    ]);

    console.log('[Seed] Creating Admin Notifications...');
    await Notification.insertMany([
      {
        studentId: 'ST1001',
        studentName: 'Alex Vance',
        title: 'High Dropout Risk Alert',
        message: 'Alex Vance (ST1001) entered High Risk bracket with 88% dropout probability.',
        type: 'risk_alert',
        isRead: false
      },
      {
        studentId: 'ST1002',
        studentName: 'Sophia Martinez',
        title: 'Attendance Deficit Warning',
        message: 'Sophia Martinez (ST1002) attendance dropped below 60% threshold.',
        type: 'attendance_alert',
        isRead: false
      },
      {
        studentId: 'ST1001',
        studentName: 'Alex Vance',
        title: 'Intervention Deadline Approaching',
        message: 'Attendance Monitoring intervention deadline due in 5 days.',
        type: 'intervention_deadline',
        isRead: true
      }
    ]);

    console.log('----------------------------------------------------');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('----------------------------------------------------');
    console.log('DEMO ADMIN CREDENTIALS:');
    console.log('Email:    admin@college.edu');
    console.log('Password: admin123');
    console.log('----------------------------------------------------');
    console.log('DEMO STUDENT CREDENTIALS:');
    console.log('High Risk Student: alex.vance@student.college.edu / student123');
    console.log('Low Risk Student:  emily.w@student.college.edu / student123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
