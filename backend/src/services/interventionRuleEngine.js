const generateInterventionRecommendations = (student) => {
  const recommendations = [];
  let issueCount = 0;

  if (student.attendance < 65) {
    issueCount++;
    recommendations.push({
      type: 'Attendance monitoring',
      title: 'Mandatory Attendance Monitoring',
      description: `Student attendance has dropped to ${student.attendance}%. Daily attendance tracking and advisory required.`,
      priority: student.attendance < 50 ? 'Urgent' : 'High'
    });
  }

  if (student.backlogs >= 3) {
    issueCount++;
    recommendations.push({
      type: 'Academic counselling',
      title: 'Backlog Remediation & Academic Counselling',
      description: `Student has ${student.backlogs} active backlogs. Specialized subject coaching and exam preparation plan needed.`,
      priority: 'Urgent'
    });
  } else if (student.backlogs >= 1) {
    issueCount++;
    recommendations.push({
      type: 'Remedial classes',
      title: 'Remedial Subject Support',
      description: `Student has ${student.backlogs} backlog. Schedule tutorial sessions for target subject.`,
      priority: 'Medium'
    });
  }

  if (student.assignmentCompletion < 50) {
    issueCount++;
    recommendations.push({
      type: 'Assignment support',
      title: 'Assignment & Coursework Assistance',
      description: `Assignment submission rate is low (${student.assignmentCompletion}%). Assign a study buddy or TA to guide coursework.`,
      priority: 'High'
    });
  }

  if (student.currentGpa < (student.previousGpa || 7.0) - 0.5) {
    issueCount++;
    recommendations.push({
      type: 'Faculty mentoring',
      title: 'Faculty Mentorship & Performance Review',
      description: `GPA declined from ${student.previousGpa} to ${student.currentGpa}. Bi-weekly faculty check-ins recommended.`,
      priority: 'High'
    });
  }

  if (student.feeStatus === 0) {
    issueCount++;
    recommendations.push({
      type: 'Financial guidance',
      title: 'Financial Aid & Scholarship Guidance',
      description: 'Tuition fees remain pending. Financial advisory meeting for fee payment options or scholarship assistance.',
      priority: 'Medium'
    });
  }

  if (issueCount >= 3) {
    recommendations.unshift({
      type: 'Academic counselling',
      title: 'Comprehensive Multi-Factor Intervention',
      description: `Student displays ${issueCount} distinct risk factors. Multi-department intervention panel with parents recommended.`,
      priority: 'Urgent'
    });
  }

  return recommendations;
};

module.exports = { generateInterventionRecommendations };
