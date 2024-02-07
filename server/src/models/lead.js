const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  date: Date,
  scheduled_at: Date,
  scheduled_to: { type: Date, required: false },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  assignment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "counsellorAssignment",
    required: false,
  },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  source_id: { type: mongoose.Schema.Types.ObjectId, ref: "Source" },
  status_id: { type: mongoose.Schema.Types.ObjectId, ref: "Status" },
  counsellor_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reference_number: {
    type: Number,
    unique: true,
  },
});

const Lead = mongoose.model("Lead", leadSchema);

module.exports = Lead;
