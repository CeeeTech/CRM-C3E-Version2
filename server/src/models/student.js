const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  nic: { type: String, required: false },
  dob: { type: Date, required: false },
  contact_no: String,
  email: { type: String, required: false },
  address: String
});

// Add pre-save hook to handle "NaN-NaN-NaN" value for dob
studentSchema.pre('save', function(next) {
  if (isNaN(Date.parse(this.dob))) {
    this.dob = null; // Set dob to null if it's not a valid date
  }
  next();
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
