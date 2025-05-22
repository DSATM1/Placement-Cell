const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// Notification schema for MongoDB
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['login', 'registration', 'status_update', 'other'], required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['sent', 'pending', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);

// Nodemailer transporter configuration (update with your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Replace with your email service (e.g., SendGrid, SMTP)
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-email-password'
  }
});

// Function to create and send a notification
const sendNotification = async ({ userId, email, type, message }) => {
  try {
    // Create notification record in MongoDB
    const notification = new Notification({
      userId,
      type,
      message,
      status: 'pending'
    });
    await notification.save();

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: `DSATM Placement Cell: ${type.charAt(0).toUpperCase() + type.slice(1)} Notification`,
      text: message,
      html: `
        <h2>DSATM Placement Cell</h2>
        <p>${message}</p>
        <p>For support, contact: admin@dsatm.edu.in</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);

    // Update notification status to sent
    notification.status = 'sent';
    await notification.save();

    return { success: true, notification };
  } catch (error) {
    console.error('Notification error:', error);
    // Update notification status to failed
    if (notification) {
      notification.status = 'failed';
      await notification.save();
    }
    return { success: false, error: error.message };
  }
};

// Function to notify on login (e.g., admin login success)
const notifyLogin = async ({ userId, email, name }) => {
  const message = `Dear ${name}, your admin account was successfully logged in at ${new Date().toLocaleString()}. If this was not you, please contact support immediately.`;
  return await sendNotification({
    userId,
    email,
    type: 'login',
    message
  });
};

// Function to notify on pending status
const notifyPendingStatus = async ({ userId, email, name }) => {
  const message = `Dear ${name}, your account is pending approval. Please contact the admin at admin@dsatm.edu.in for assistance.`;
  return await sendNotification({
    userId,
    email,
    type: 'status_update',
    message
  });
};

// Function to get all notifications for a user
const getUserNotifications = async (userId) => {
  try {
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    return { success: true, notifications };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendNotification,
  notifyLogin,
  notifyPendingStatus,
  getUserNotifications
};