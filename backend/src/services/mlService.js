const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

const predictDropoutRisk = async (studentData) => {
  try {
    const payload = {
      attendance: Number(studentData.attendance || 80),
      currentGpa: Number(studentData.currentGpa || 7.0),
      previousGpa: Number(studentData.previousGpa || studentData.currentGpa || 7.0),
      backlogs: Number(studentData.backlogs || 0),
      assignmentCompletion: Number(studentData.assignmentCompletion || 80),
      internalMarks: Number(studentData.internalMarks || 75),
      semesterMarks: Number(studentData.semesterMarks || 75),
      participation: Number(studentData.participation || 70),
      feeStatus: Number(studentData.feeStatus ?? 1)
    };

    console.log(`[ML Service] Sending request to ${ML_SERVICE_URL}/predict ...`);
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, payload, { timeout: 4000 });
    return response.data;
  } catch (error) {
    console.warn(`[ML Service Warning] Could not connect to Python ML service at ${ML_SERVICE_URL}: ${error.message}. Using built-in ML algorithm fallback.`);
    
    // Built-in rule & fallback ML score generator matching Python model logic
    const att = Number(studentData.attendance || 80);
    const gpa = Number(studentData.currentGpa || 7.0);
    const prevGpa = Number(studentData.previousGpa || gpa);
    const backlogs = Number(studentData.backlogs || 0);
    const assignComp = Number(studentData.assignmentCompletion || 80);
    const internal = Number(studentData.internalMarks || 75);
    const fee = Number(studentData.feeStatus ?? 1);

    const rawScore = (
      (100 - att) * 0.28 +
      (10 - gpa) * 6.0 +
      backlogs * 9.5 +
      (100 - assignComp) * 0.15 +
      (100 - internal) * 0.12 +
      (1 - fee) * 12
    );

    const riskScore = Math.max(0, Math.min(100, Math.round(rawScore)));
    let riskLevel = 'LOW';
    if (riskScore >= 70) riskLevel = 'HIGH';
    else if (riskScore >= 40) riskLevel = 'MEDIUM';

    const factors = [];
    if (att < 65) factors.push('Low attendance percentage (<65%)');
    if (backlogs >= 2) factors.push('Multiple active backlogs (>=2)');
    if (assignComp < 50) factors.push('Low assignment completion (<50%)');
    if (gpa < 5.5) factors.push('Low academic GPA (<5.5)');
    if (gpa < prevGpa - 0.5) factors.push('Declining GPA trend');
    if (fee === 0) factors.push('Pending tuition fee payment');
    if (factors.length === 0) factors.push('Satisfactory academic progress & attendance');

    return {
      riskScore,
      riskLevel,
      factors
    };
  }
};

module.exports = { predictDropoutRisk };
