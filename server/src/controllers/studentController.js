const Student = require("../models/student");
const Lead = require("../models/lead");
const mongoose = require("mongoose");

async function getStudents(req, res) {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function addStudent(req, res) {
  const { name, nic, dob, contact_no, email, address } = req.body;

  try {
    // Check if a student with the given email already exists
    const existingStudent = await Student.findOne({ email: email });
    if (existingStudent) {
      return res
        .status(400)
        .json({ error: "Student with this email already exists" });
    }

    // Create a new student
    const newStudent = await Student.create({
      name,
      nic,
      dob,
      contact_no,
      email,
      address,
    });

    res.status(200).json(newStudent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getStudent(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "No such Student" });
  }

  const student = await Student.findById({ _id: id });

  if (!student) {
    res.status(400).json({ error: "No such Student" });
  }

  res.status(200).json(student);
}

//update student
async function updateStudent(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "No such Student" });
  }

  const student = await Student.findByIdAndUpdate(
    { _id: id },
    {
      ...req.body,
    }
  );

  if (!student) {
    res.status(400).json({ error: "no such Student" });
  }

  res.status(200).json(student);
}

async function searchStudents(req, res) {
  // const { term } = req.query;

  try {
    const students = await Student.find();

    const studentDetails = [];

    for (const student of students) {
      const lead = await Lead.findOne({ student_id: student._id })
        .populate("course_id", "name")
        .populate("branch_id", "name")
        .exec();
      if (lead) {
        const studentDetail = {
          id: student._id,
          name: student.name,
          dob: student.dob,
          email: student.email,
          address: student.address,
          contact_no: student.contact_no,
          course: lead.course_id ? lead.course_id.name : null,
          branch: lead.branch_id ? lead.branch_id.name : null,
          date: lead.date,
          scheduled_to: lead.scheduled_to,
        };
        studentDetails.push(studentDetail);
      } else {
        const studentDetail = {
          id: student._id,
          name: student.name,
          dob: student.dob,
          email: student.email,
          address: student.address,
          contact_no: student.contact_no,
        };
        studentDetails.push(studentDetail);
      }
    }
    res.status(200).json(studentDetails);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getStudents,
  addStudent,
  getStudent,
  updateStudent,
  searchStudents,
};
