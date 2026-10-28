const Intervention = require('../models/Intervention');
const Mentor = require('../models/Mentor');
const Student = require('../models/Student');
const Notification = require('../models/Notification');

// @desc    Get all interventions
// @route   GET /api/interventions
// @access  Private
const getInterventions = async (req, res, next) => {
  try {
    const { studentId, status, priority, type } = req.query;
    const query = {};

    if (studentId) query.studentId = studentId;
    if (status && status !== 'All') query.status = status;
    if (priority && priority !== 'All') query.priority = priority;
    if (type && type !== 'All') query.type = type;

    const interventions = await Intervention.find(query).sort({ createdAt: -1 });
    res.json(interventions);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new intervention
// @route   POST /api/interventions
// @access  Private/Admin
const createIntervention = async (req, res, next) => {
  try {
    const { studentId, title, type, mentorId, mentorName, priority, description, deadline } = req.body;

    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: `Student with ID ${studentId} not found` });
    }

    const newIntervention = await Intervention.create({
      studentId,
      title,
      type,
      mentorId: mentorId || null,
      mentorName: mentorName || 'Unassigned',
      priority: priority || 'Medium',
      description: description || '',
      status: 'Pending',
      deadline: deadline ? new Date(deadline) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default 2 weeks
      createdBy: req.user ? req.user.name : 'System Admin'
    });

    if (mentorId) {
      await Mentor.findByIdAndUpdate(mentorId, { $inc: { activeInterventionsCount: 1 } });
    }

    // Notify student/admin
    await Notification.create({
      studentId: student.studentId,
      studentName: student.name,
      title: 'Intervention Assigned',
      message: `New intervention "${title}" has been assigned for ${student.name}.`,
      type: 'intervention_deadline'
    });

    res.status(201).json(newIntervention);
  } catch (error) {
    next(error);
  }
};

// @desc    Update intervention details or status
// @route   PUT /api/interventions/:id
// @access  Private
const updateIntervention = async (req, res, next) => {
  try {
    const intervention = await Intervention.findById(req.params.id);
    if (!intervention) {
      return res.status(404).json({ message: 'Intervention not found' });
    }

    const previousStatus = intervention.status;
    const previousMentorId = intervention.mentorId;

    Object.assign(intervention, req.body);
    const updated = await intervention.save();

    // Adjust mentor count if status changed to Completed/Cancelled
    if (updated.mentorId && previousStatus !== updated.status) {
      if (['Completed', 'Cancelled'].includes(updated.status) && ['Pending', 'In Progress'].includes(previousStatus)) {
        await Mentor.findByIdAndUpdate(updated.mentorId, { $inc: { activeInterventionsCount: -1 } });
      } else if (['Pending', 'In Progress'].includes(updated.status) && ['Completed', 'Cancelled'].includes(previousStatus)) {
        await Mentor.findByIdAndUpdate(updated.mentorId, { $inc: { activeInterventionsCount: 1 } });
      }
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete intervention
// @route   DELETE /api/interventions/:id
// @access  Private/Admin
const deleteIntervention = async (req, res, next) => {
  try {
    const intervention = await Intervention.findById(req.params.id);
    if (!intervention) {
      return res.status(404).json({ message: 'Intervention not found' });
    }

    if (intervention.mentorId && ['Pending', 'In Progress'].includes(intervention.status)) {
      await Mentor.findByIdAndUpdate(intervention.mentorId, { $inc: { activeInterventionsCount: -1 } });
    }

    await Intervention.deleteOne({ _id: intervention._id });
    res.json({ message: 'Intervention removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Student action on intervention (acknowledge, add note, request meeting, update status)
// @route   PUT /api/interventions/:id/student-action
// @access  Private
const studentInterventionAction = async (req, res, next) => {
  try {
    const intervention = await Intervention.findById(req.params.id);
    if (!intervention) {
      return res.status(404).json({ message: 'Intervention not found' });
    }

    const { action, note, meetingDate, meetingNotes, status } = req.body;

    if (action === 'acknowledge') {
      intervention.studentAcknowledged = true;
      if (intervention.status === 'Pending') intervention.status = 'In Progress';
    }

    if (note) {
      intervention.studentNotes = note;
    }

    if (action === 'request_meeting') {
      intervention.meetingRequested = true;
      if (meetingDate) intervention.meetingDate = new Date(meetingDate);
      if (meetingNotes) intervention.meetingNotes = meetingNotes;
    }

    if (status && ['In Progress', 'Completed'].includes(status)) {
      intervention.status = status;
    }

    const updated = await intervention.save();

    // Create Notification
    await Notification.create({
      studentId: intervention.studentId,
      studentName: req.user ? req.user.name : 'Student',
      title: 'Intervention Update by Student',
      message: `${req.user ? req.user.name : 'Student'} updated intervention: ${intervention.title} (${action || 'progress update'}).`,
      type: 'intervention_deadline'
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInterventions,
  createIntervention,
  updateIntervention,
  studentInterventionAction,
  deleteIntervention
};
