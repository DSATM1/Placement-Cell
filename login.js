const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Check if all required fields are provided
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate role
    const validRoles = ['student', 'recruiter', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if role matches
    if (user.role !== role) {
      return res.status(401).json({ message: 'Role does not match' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    // Send success response
    res.status(200).json({
      message: 'Login successful',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = { login };