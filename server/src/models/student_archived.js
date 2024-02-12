const mongoose = require("mongoose");

const studentArchivedSchema = new mongoose.Schema({
  name: String,
  nic: { type: String, required: false },
  dob: { type: Date, required: false },
  contact_no: String,
  email: { type: String, required: false, unique: true },
  address: String
});

// Add pre-save hook to handle "NaN-NaN-NaN" value for dob
studentSchema.pre('save', function(next) {
  if (this.dob === 'NaN-NaN-NaN') {
    this.dob = null; // Set dob to null if it's "NaN-NaN-NaN"
  }
  next();
});

const Student = mongoose.model("Student_Archived", studentArchivedSchema);

module.exports = Student;
