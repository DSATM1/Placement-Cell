const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Added for token generation

// Registration route handler
const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if all required fields are provided
    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate role
    const validRoles = ['student', 'recruiter', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user object
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      role
    });

    // Save the new user to the database
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || 'your_jwt_secret', // Ensure JWT_SECRET is set in .env
      { expiresIn: '1h' }
    );

    // Send success response with user and token
    res.status(201).json({
      message: 'Registration successful',
      user: {
        _id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
      token
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

module.exports = { register };