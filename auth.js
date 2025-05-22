const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { notifyLogin, notifyPendingStatus } = require('../models/Notification');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const login = async (req, res) => {
  const { role, email, password } = req.body;

  try {
    // Validate input
    if (!role || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find user by email and role
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or role' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Check user status
    if (user.status === 'pending') {
      await notifyPendingStatus({
        userId: user._id,
        email: user.email,
        name: user.name
      });
      return res.status(403).json({ message: 'Account is pending approval. Please contact the admin at admin@dsatm.edu.in.' });
    }

    if (user.status !== 'approved') {
      return res.status(403).json({ message: 'Account is not approved' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send login success notification
    await notifyLogin({
      userId: user._id,
      email: user.email,
      name: user.name
    });

    // Return success response
    res.status(200).json({
      token,
      user: {
        role: user.role,
        email: user.email,
        name: user.name,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = { login };