const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
  },
  studentsPlaced: {
    type: Number,
    required: true,
  },
  averagePackage: {
    type: Number,
    required: true,
  },
  topRecruiter: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);