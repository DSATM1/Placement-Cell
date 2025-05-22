// routes/reports.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Reports route is working!');
});

module.exports = router;
