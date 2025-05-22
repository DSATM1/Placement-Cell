const express = require('express');
const Contact = require('../models/Contact');
const router = express.Router();

// Create a new contact message
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }
    const contact = new Contact({ name, email, subject, message });
    await contact.save();
    res.status(201).json({ message: 'Contact message saved successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
