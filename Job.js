const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'open', 'closed'],
    default: 'pending',
  },
  deadline: {
    type: Date,
    required: true,
  },
  eligibility: {
    type: String,
    required: true,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);