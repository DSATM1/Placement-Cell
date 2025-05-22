const express = require('express');
const Job = require('../models/Job');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all jobs (accessible to students and admins)
router.get('/', auth(['student', 'admin']), async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'open' }).populate('postedBy', 'companyName');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get jobs posted by recruiter
router.get('/my-jobs', auth(['recruiter']), async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Post a job (recruiter only)
router.post('/', auth(['recruiter']), async (req, res) => {
  try {
    const { title, company, deadline, eligibility } = req.body;
    const job = new Job({
      title,
      company,
      deadline,
      eligibility,
      postedBy: req.user.id,
    });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const Notification = require('../models/Notification');
const { Student } = require('../models/User');

// Approve/Reject job (admin only)
router.patch('/:id', auth(['admin']), async (req, res) => {
  try {
    const { status } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    job.status = status;
    await job.save();

    // Create notification for all students about job status update
    const students = await Student.find({});
    const notifications = students.map(student => ({
      message: `Job "${job.title}" status has been updated to "${status}".`,
      user: student._id,
    }));
    await Notification.insertMany(notifications);

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
