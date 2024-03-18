const mongoose = require("mongoose");

const ReferralStudentSchema = new mongoose.Schema({
  name: String,
  nic: { type: String, required: false },
  dob: { type: Date, required: false },
  contact_no: String,
  email: { type: String, required: false, unique: true },
  address: String
});

// Add pre-save hook to handle "NaN-NaN-NaN" value for dob
ReferralStudentSchema.pre('save', function(next) {
  if (this.dob === 'NaN-NaN-NaN') {
    this.dob = null; // Set dob to null if it's "NaN-NaN-NaN"
  }
  next();
});

const ReferralStudent = mongoose.model("ReferralStudent", ReferralStudentSchema);

module.exports = ReferralStudent;
