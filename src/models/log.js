// models/log.js
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  userAccessType: String,
  functionName: String,
  moduleName: String,
  data: mongoose.Schema.Types.Mixed,
  status: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Log', logSchema);
