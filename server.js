const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const { login } = require('./routes/login');
const { register } = require('./routes/register');
const jobRoutes = require('./routes/jobs');

// Load .env file explicitly
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../Frontend')));

// MongoDB connection
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('Error: MONGO_URI is not defined in .env file');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

// Routes
app.post('/api/auth/login', login);
app.post('/api/auth/register', register);
app.use('/api/jobs', jobRoutes);

// Stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const stats = {
      placementRate: 95,
      companies: 150,
      jobs: 500,
      studentsPlaced: 1200,
      avgSalary: 8,
      topRecruiters: 30,
      internships: 400,
      satisfaction: 90
    };
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// Testimonials endpoint
app.get('/api/testimonials', async (req, res) => {
  try {
    const testimonials = [
      { text: 'The DSATM portal made my job search efficient. I landed my dream job at Amazon!', author: 'Rahul Sharma', role: 'Software Engineer, Amazon (2024 Batch)' },
      { text: 'Impressed with the quality of candidates from DSATM. The portal’s tools are top-notch.', author: 'Priya Nair', role: 'HR Manager, Infosys' },
      { text: 'The analytics dashboard helps us improve our training programs continuously.', author: 'Dr. Suresh Kumar', role: 'Placement Officer, DSATM' }
    ];
    res.status(200).json(testimonials);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching testimonials' });
  }
});

// Notification route
const { getUserNotifications } = require('./models/Notification');
app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await getUserNotifications(userId);
    if (result.success) {
      res.status(200).json(result.notifications);
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start server
const PORT = process.env.PORT || 1212;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));