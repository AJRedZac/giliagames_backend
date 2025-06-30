const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  ip: String,
  path: String,
  userAgent: String,
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Visit', VisitSchema);
