const Referral = require("../models/referral");
const Referee = require("../models/referee");
const ReferralStudent = require("../models/referralStudent");
const ReferralFollowup = require("../models/ReferralFollowup");
const refstatuses = require("../models/ref_status");
const Course = require("../models/course");
const Status = require("../models/status");
const Branch = require("../models/branch");
const Source = require("../models/source");
const Counter = require("../models/counter");
const Lead = require("../models/lead");
const Student = require("../models/student");
const FollowUp = require("../models/followUp");
const referralFollowupAssignment = require("../models/followUpAssignment");
const moment = require("moment-timezone");

// add new referral
async function addNewReferral(req, res) {
  let currentDate = new Date();
  const targetTimeZone = "Asia/Colombo"; // Replace with the desired time zone
  const customDateUTC = new Date(
    moment.tz(currentDate, targetTimeZone).format("YYYY-MM-DDTHH:mm:ss[Z]")
  );
  const {
    name,
    nic,
    dob,
    contact_no,
    email,
    address,
    course_name,
    branch_name,
    referee_id,
  } = req.body;

  try {
    // Find course
    const course = await Course.findOne({ name: course_name });
    if (!course) {
      return res
        .status(400)
        .json({ error: `Course not found: ${course_name}` });
    }

    // Find branch
    const branch = await Branch.findOne({ name: branch_name });
    if (!branch) {
      return res
        .status(400)
        .json({ error: `Branch not found: ${branch_name}` });
    }

    // Find referee
    const referee = await Referee.findById(referee_id);
    if (!referee) {
      return res
        .status(400)
        .json({ error: `Referee not found with ID: ${referee_id}` });
    }

    // Find source
    const source = await Source.findOne({ name: "referral" });
    if (!source) {
      return res.status(400).json({ error: `Source not found: referral` });
    }

    // find status
    const status = await refstatuses.findOne({ name: "processing" });
    if (!status) {
      return res.status(400).json({ error: `Status not found: processing` });
    }

    // Create a new student
    const newStudent = await ReferralStudent.create({
      name,
      nic,
      dob,
      contact_no,
      email,
      address,
    });

    const student_id = newStudent._id;

    // Create referral
    const sequenceValue = await getNextSequenceValue("unique_id_sequence");
    const referral = await Referral.create({
      date: customDateUTC,
      course_id: course._id,
      branch_id: branch._id,
      source_id: source._id,
      student_id,
      referee_id,
      ref_status_id: status._id,
      reference_number: sequenceValue,
    });

    console.log("referral", referral);

    // add referral followup
    const followup = await ReferralFollowup.create({
      referral_id: referral._id,
      ref_status_id: status._id,
      date: new Date(),
    });
    if (!followup) {
      return res.status(500).json({ error: "Follow Up Error" });
    }

    console.log("followup", followup);

    // add referral followup assignment
    const followupAssignment = await referralFollowupAssignment.create({
      referral_id: referral._id,
      status_id: status._id,
      assigned_at: customDateUTC,
    });
    if (!followupAssignment) {
      return res.status(500).json({ error: "Follow Up Assignment Error" });
    }

    // find status
    const newStatus = await Status.findOne({ name: "New" });
    if (!newStatus) {
      return res.status(400).json({ error: `Status not found: New` });
    }

    // add student details to student table
    const newLeadStudent = await Student.create({
      name,
      nic,
      dob,
      contact_no,
      email,
      address,
      status_id: newStatus._id,
    });

    const newLeadStudentId = newLeadStudent._id;

    // add lead details to lead table
    const newLead = await Lead.create({
      student_id: newLeadStudentId,
      course_id: course._id,
      branch_id: branch._id,
      source_id: source._id,
      referee_id,
      status_id: newStatus._id,
      reference_number: referral.reference_number,
    });

    // add followup details to followup table
    const newFollowUp = await FollowUp.create({
      lead_id: newLead._id,
      status_id: newStatus._id,
      date: new Date(),
    });
    if (!newFollowUp) {
      return res.status(500).json({ error: "Lead Follow Up Error" });
    }

    res.status(200).json({ message: "Referral added successfully", referral });
  } catch (error) {
    console.error("Error adding referral:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getNextSequenceValue(sequenceName) {
  const counter = await Counter.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    { returnOriginal: false, upsert: true }
  );
  return counter.sequence_value;
}

// get refarrals according to the referee
async function getReferralByReferee(req, res) {
  const { referee_id } = req.body;
  try {
    const referrals = await Referral.find({ referee_id });
    res.status(200).json({ referrals });
  } catch (error) {
    console.error("Error getting referrals:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// get all referrals according to the user
// async function getAllReferral(req, res) {
//   try {
//     const referrals = await Referral.find();
//     res.status(200).json({ referrals });
//   } catch (error) {
//     console.error("Error getting referrals:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }

// get all referrals by populating the student and course details, branch details, referee details, source details and status details
async function getAllReferral(req, res) {
  try {
    const referrals = await Referral.find()
      .populate("student_id")
      .populate("course_id")
      .populate("branch_id")
      .populate("referee_id")
      .populate("ref_status_id");

    res.status(200).json({ referrals });
    console.log("referrals", referrals);
  } catch (error) {
    console.error("Error getting referrals:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  addNewReferral,
  getAllReferral,
  getReferralByReferee,
};
