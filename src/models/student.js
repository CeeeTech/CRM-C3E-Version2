const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  nic: { type: String, required: false },
  dob: { type: Date, required: false },
  contact_no: String,
  email: { type: String, required: false, unique: true},
  address: String
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
