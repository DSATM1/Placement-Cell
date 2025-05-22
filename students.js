const express = require('express');
const { Student } = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all students (admin only)
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const students = await Student.find().select('-password');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve/Reject student (admin only)
router.patch('/:id', auth(['admin']), async (req, res) => {
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
