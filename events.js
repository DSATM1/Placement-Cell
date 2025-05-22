const express = require('express');
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all events (accessible to all authenticated users)
router.get('/', auth(['student', 'recruiter', 'admin']), async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const Notification = require('../models/Notification');

// Create event (admin only)
router.post('/', auth(['admin']), async (req, res) => {
  try {
    const { title, date, time, location } = req.body;
    const event = new Event({ title, date, time, location });
    await event.save();

    // Create notification for all students about new event
    const students = await require('../models/User').find({ role: 'student' });
    const notifications = students.map(student => ({
      message: `New event "${title}" scheduled on ${date} at ${time}, location: ${location}.`,
      user: student._id,
    }));
    await Notification.insertMany(notifications);

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;