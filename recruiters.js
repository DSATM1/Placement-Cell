const express = require('express');
const { Recruiter, Student } = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all recruiters (admin only)
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const recruiters = await Recruiter.find().select('-password');
    res.json(recruiters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve/Reject recruiter (admin only)
router.patch('/:id', auth(['admin']), async (req, res) => {
  try {
    const { status } = req.body;
    const recruiter = await Recruiter.findById(req.params.id);
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }
    recruiter.status = status;
    await recruiter.save();
    res.json(recruiter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all students (recruiter only)
router.get('/students', auth(['recruiter']), async (req, res) => {
  try {
    const students = await Student.find().select('-password');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve/Reject student (recruiter only)
router.patch('/students/:id', auth(['recruiter']), async (req, res) => {
  try {
    const { status } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    student.status = status;
    await student.save();
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
