const Lead = require("../models/lead");
const Course = require("../models/course");
const Status = require("../models/status");
const Branch = require("../models/branch");
const Source = require("../models/source");
const Student = require("../models/student");
const FollowUp = require("../models/followUp");
const User_type = require("../models/user_type");
const CounsellorAssignment = require("../models/counsellorAssignment");
const { default: mongoose } = require("mongoose");
const Counter = require("../models/counter");
const LeadArchived = require("../models/lead_archived");
const FollowUpArchived = require("../models/followUp_archived");
const csvtojson = require("csvtojson");
// const { emitNotification } = require("../service/notification");
const User = require("../models/user");
const Notification = require("../models/notification");
const notificationController = require("../controllers/notificationController");
const moment = require("moment-timezone");
const fs = require("fs");
const cron = require("node-cron");
const startTime = 8;
const endTime = 17;
const threshold = 4;
//get all leads

async function getLeads(req, res) {
  try {
    const leads = await Lead.find();
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ error: "Internal Sserver Error" });
  }
}

//get one lead
async function getLead(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "No such lead" });
  }

  const lead = await Lead.findById({ _id: id });

  if (!lead) {
    res.status(400).json({ error: "No such lead" });
  }

  res.status(200).json(lead);
}

async function bulkImport(req, res) {
  try {
    const requiredColumns = ["name", "email", "contact_no", "course_code"];
    // Convert the uploaded CSV file to JSON
    const leads = await csvtojson().fromString(req.file.buffer.toString());

    const csvHeaders = Object.keys(leads[0]); // Assuming the first row contains headers

    // Check if all required columns are present
    const missingColumns = requiredColumns.filter(
      (column) => !csvHeaders.includes(column)
    );

    if (missingColumns.length > 0) {
      res
        .status(400)
        .json({ success: false, message: `Missing columns:${missingColumns}` });

      // Handle the case where one or more columns are missing
    } else {
      let bulk_upload_details = {
        successfuly_added_leads: 0,
        existing_student_added_leads: 0,
        error_added_leads: 0,
        added_without_counselor: 0,
      };

      for (const lead of leads) {
        let student_id;
        const existingStudent = await Student.findOne({ email: lead.email });
        if (existingStudent) {
          student_id = existingStudent._id;
        } else {
          const newStudent = await Student.create({
            name: lead.name,
            dob: null,
            contact_no: lead.contact_no,
            email: lead.email,
          });
          student_id = newStudent._id;
        }

        // Generate reference number for the lead
        const reference_number = await getNextSequenceValue(
          "unique_id_sequence"
        );

        added_response = await addLeadDefault(
          student_id,
          lead.course_code,
          reference_number
        );
        switch (added_response) {
          case "error":
            bulk_upload_details.error_added_leads =
              bulk_upload_details.error_added_leads + 1;
            break;
          case "added_without_counselor":
            bulk_upload_details.added_without_counselor =
              bulk_upload_details.added_without_counselor + 1;
            break;
          case "success":
            if (existingStudent) {
              bulk_upload_details.existing_student_added_leads =
                bulk_upload_details.existing_student_added_leads + 1;
            } else {
              bulk_upload_details.successfuly_added_leads =
                bulk_upload_details.successfuly_added_leads + 1;
            }
            break;
          default:
            text = "No value found";
        }
      }

      res.status(200).json({
        success: true,
        message: "Number of Leads added successfully",
        bulk_upload_details,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error processing CSV file" });
  }
}

async function addLeadDefault(student_id, course_code, reference_number) {
  try {
    let date = new Date();

    const targetTimeZone = "Asia/Colombo"; // Replace with the desired time zone
    date = new Date(
      moment.tz(date, targetTimeZone).format("YYYY-MM-DDTHH:mm:ss[Z]")
    ); // Replace with your desired date and time in UTC

    // Check if course_name exists in the course table
    let course_document = await Course.findOne({ course_code: course_code });
    if (!course_document) {
      course_document = await Course.findOne({ course_code: "other" });
    }

    // Fetch the Branch
    branch_document = await Branch.findOne({ name: "Other" });

    // Check if student exists in the student table
    if (!mongoose.Types.ObjectId.isValid(student_id)) {
      return "error";
    }

    // Check if source name exists in the source table
    const source_document = await Source.findOne({ name: "bulk" });
    if (!source_document) {
      return "error";
    }

    // Create new lead
    const newLead = await Lead.create({
      date: date,
      sheduled_at: date,
      scheduled_to: null,
      course_id: course_document._id,
      branch_id: branch_document._id,
      student_id: student_id,
      user_id: null,
      source_id: source_document._id,
      reference_number: reference_number, // Use the provided reference_number
    });

    const { leastAllocatedCounselor } =
      await getLeastAndNextLeastAllocatedCounselors(
        course_document._id.toString()
      );

    if (leastAllocatedCounselor) {
      const cid = leastAllocatedCounselor._id;

      // Create new counselor assignment
      const newCounsellorAssignment = await CounsellorAssignment.create({
        lead_id: newLead._id,
        counsellor_id: cid,
        assigned_at: date,
      });
      const status = await Status.findOne({ name: "New" });

      const newFollowUp = await addFollowUpDefualt(
        newLead._id,
        cid,
        status._id,
        date
      );

      const studentDoc = await Student.findById({ _id: student_id });

      // Update lead with assignment_id
      newLead.assignment_id = newCounsellorAssignment._id;
      newLead.counsellor_id = cid;
      await newLead.save();

      await notificationController.sendNotificationToCounselor(
        cid,
        `You have assigned a new lead belongs to ${studentDoc.email}.`,
        "success"
      );

      return "success";
    } else {
      const status = await Status.findOne({ name: "New" });

      const newFollowUp = await addFollowUpDefualt(
        newLead._id,
        null,
        status._id,
        date
      );

      return "added_without_counselor";
    }
  } catch (error) {
    return "error";
  }
}

async function addFollowUpDefualt(lead_id, user_id, status, date) {
  // Check if lead exists in the lead table
  if (!mongoose.Types.ObjectId.isValid(lead_id)) {
  }

  // Check if status exists in the status table; the passed status is the id of the status
  else if (!mongoose.Types.ObjectId.isValid(status)) {
  }

  // Check if user exists in the user table
  else if (!mongoose.Types.ObjectId.isValid(user_id)) {
  }

  // Current datetime
  const currentDateTime = date;

  try {
    const newFollowUp = await FollowUp.create({
      lead_id: lead_id,
      user_id: user_id,
      status_id: status,
      date: currentDateTime,
    });

    const leadDoc = await Lead.findById({ _id: lead_id });
    leadDoc.status_id = status;
    await leadDoc.save();
  } catch (error) {}
}

// move the lead, student and followup to the lead_archive, student_archive and followup_archive tables
// and delete the lead, student and followup from the lead, student and followup tables
async function archiveLeads(req, res) {
  let ids = req.body.ids; // Retrieve the IDs from the request body

  // If ids is not an array, convert it to an array with a single element
  if (!Array.isArray(ids)) {
    ids = [ids];
  }

  for (const id of ids) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Invalid lead ID" });
    }

    const lead = await Lead.findById(id);

    const student = await Student.findById(lead.student_id);

    const followUps = await FollowUp.find({ lead_id: id });

    // Create a new lead_archive entry
    const newLeadArchived = await LeadArchived.create({
      date: lead.date,
      scheduled_at: lead.scheduled_at,
      scheduled_to: lead.scheduled_to,
      course_id: lead.course_id,
      branch_id: lead.branch_id,
      student_id: lead.student_id,
      user_id: lead.user_id,
      source_id: lead.source_id,
      reference_number: lead.reference_number,
    });

    // Create a new student_archive entry
    // const newStudentArchived = await StudentArchived.create({
    //   name: student.name,
    //   nic: student.nic,
    //   dob: student.dob,
    //   contact_no: student.contact_no,
    //   email: student.email,
    //   address: student.address,
    // });

    // Create new followup_archive entries
    if (followUps.length > 0) {
      for (const followUp of followUps) {
        await FollowUpArchived.create({
          lead_id: followUp.lead_id,
          user_id: followUp.user_id,
          status_id: followUp.status_id,
          date: followUp.date,
        });
      }
    }

    // Delete the lead, student, and follow-up from the original tables
    await Lead.findByIdAndDelete(id);
    // await Student.findByIdAndDelete(lead.student_id);
    await FollowUp.deleteMany({ lead_id: id });
  }

  res.status(200).json({ message: "Leads archived successfully" });
}

async function restoreLead(req, res) {
  const { id } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such lead" });
  }

  const lead = await Lead.findById({ _id: id });

  if (!lead) {
    return res.status(400).json({ error: "No such lead" });
  }

  // Assuming you have a FollowUp model with a reference to Lead
  const followUps = await FollowUp.find({ lead_id: id })
    .sort({ date: -1 })
    .limit(1);
  if (followUps.length === 0) {
    return res.status(404).json({ error: "No follow-up entries for the lead" });
  }

  const lastFollowUpId = followUps[0]._id;

  // Delete the last entry in the FollowUp table
  await FollowUp.findByIdAndDelete(lastFollowUpId);
  const newLastFollowUp = await FollowUp.find({ lead_id: id })
    .sort({ date: -1 })
    .limit(1);

  if (newLastFollowUp.length === 0) {
    // If newLastFollowUp is empty, handle this case accordingly
    return res.status(400).json({ error: "No followup to reverse." });
    // You might want to return an error response or take other appropriate action
  }

  const updatedLead = await Lead.findByIdAndUpdate(
    id, // Assuming 'id' is the lead's ID you want to update
    { $set: { status_id: newLastFollowUp[0].status_id } }, // Update the 'status' field to the desired new value
    { new: true } // Set to true to return the modified document rather than the original
  );

  if (updateLead) {
    res.status(200).json({ message: "Lead restored successfully" });
  } else {
    return res.status(400).json({ error: "An error occured" });
  }
}

//add new lead student followup
async function addLead(req, res) {
  const {
    name,
    nic,
    dob,
    contact_no,
    email,
    address,
    date,
    sheduled_to,
    course_name,
    branch_name,
    user_id,
  } = req.body;

  var student_id;
  var lead_id;

  // add student
  try {
    // Create a new student
    const newStudent = await Student.create({
      name,
      nic,
      dob,
      contact_no,
      email,
      address,
    });

    student_id = newStudent._id;
    // res.status(200).json(newStudent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }

  //add lead
  try {
    // Check if course_name exists in the course table
    const course_document = await Course.findOne({ name: course_name });
    if (!course_document) {
      return res
        .status(400)
        .json({ error: `Course not found: ${course_name}` });
    }

    // Check if branch_name exists in the branch table
    const branch_document = await Branch.findOne({ name: branch_name });
    if (!branch_document) {
      return res
        .status(400)
        .json({ error: `Branch not found: ${branch_name}` });
    }

    // Current datetime
    let currentDate = new Date();
    const targetTimeZone = "Asia/Colombo"; // Replace with the desired time zone
    const customDateUTC = new Date(
      moment.tz(currentDate, targetTimeZone).format("YYYY-MM-DDTHH:mm:ss[Z]")
    ); // Replace with your desired date and time in UTC

    // Check if student exists in the student table
    if (!mongoose.Types.ObjectId.isValid(student_id)) {
      return res.status(400).json({ error: "No such student" });
    }

    // Check if user exists in the user table
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ error: "No such user" });
    }

    // Check if source name exists in the source table
    const source_document = await Source.findOne({ name: "manual" });
    if (!source_document) {
      return res.status(400).json({ error: `Source not found: manual` });
    }

    const sequenceValue = await getNextSequenceValue("unique_id_sequence");

    // Create new lead
    const newLead = await Lead.create({
      date: customDateUTC,
      sheduled_at: customDateUTC,
      scheduled_to: sheduled_to,
      course_id: course_document._id,
      branch_id: branch_document._id,
      student_id: student_id,
      user_id: user_id,
      source_id: source_document._id,
      reference_number: sequenceValue,
    });

    lead_id = newLead._id;
    // Send success response
    // res.status(200).json(newLead);

    var cid;

    const { leastAllocatedCounselor } =
      await getLeastAndNextLeastAllocatedCounselors(
        course_document._id.toString()
      );

    if (leastAllocatedCounselor) {
      cid = leastAllocatedCounselor._id;

      // Create new counselor assignment
      const newCounsellorAssignment = await CounsellorAssignment.create({
        lead_id: newLead._id,
        counsellor_id: cid,
        assigned_at: date,
      });

      const studentDoc = await Student.findById({ _id: student_id });

      // Update lead with assignment_id
      newLead.assignment_id = newCounsellorAssignment._id;
      newLead.counsellor_id = cid;
      await newLead.save();

      await notificationController.sendNotificationToCounselor(
        cid,
        `You have assigned a new lead belongs to ${studentDoc.email}.`,
        "success"
      );
    } else {
    }
  } catch (error) {
    // Send internal server error response
    res.status(500).json({ error: "Internal Server Error" });
  }

  try {
    // Check if lead exists in the lead table
    if (!mongoose.Types.ObjectId.isValid(lead_id)) {
      return res.status(400).json({ error: "no such lead" });
    }

    // Check if user exists in the user table
    else if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ error: "no such user" });
    }

    const status_document = await Status.findOne({ name: "New" });
    if (!status_document) {
      return res.status(400).json({ error: `Status not found: New` });
    }

    // Current datetime

    let currentDate = new Date();
    const targetTimeZone = "Asia/Colombo"; // Replace with the desired time zone
    const currentDateTime = new Date(
      moment.tz(currentDate, targetTimeZone).format("YYYY-MM-DDTHH:mm:ss[Z]")
    );

    try {
      const newFollowUp = await FollowUp.create({
        lead_id: lead_id,
        user_id: user_id,
        status_id: status_document._id,
        date: currentDateTime,
      });

      const leadDoc = await Lead.findById({ _id: lead_id });
      leadDoc.status_id = status_document._id;
      await leadDoc.save();

      return res.status(200).json(newFollowUp);
    } catch (error) {
      // return res.status(500).json({ error: "Internal Server Error" });
    }
  } catch (e) {}
}

//add lead and followup
async function addLeadWithExistingStudent(req, res) {
  const { student_id, date, sheduled_to, course_name, branch_name, user_id } =
    req.body;

  //add lead
  try {
    // Check if course_name exists in the course table
    const course_document = await Course.findOne({ name: course_name });
    if (!course_document) {
      return res
        .status(400)
        .json({ error: `Course not found: ${course_name}` });
    }

    // Check if branch_name exists in the branch table
    const branch_document = await Branch.findOne({ name: branch_name });
    if (!branch_document) {
      return res
        .status(400)
        .json({ error: `Branch not found: ${branch_name}` });
    }

    // Current datetime
    let currentDate = new Date();
    const targetTimeZone = "Asia/Colombo"; // Replace with the desired time zone
    const currentDateTime = new Date(
      moment.tz(currentDate, targetTimeZone).format("YYYY-MM-DDTHH:mm:ss[Z]")
    );

    // Check if student exists in the student table
    if (!mongoose.Types.ObjectId.isValid(student_id)) {
      return res.status(400).json({ error: "No such student" });
    }

    // Check if user exists in the user table
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ error: "No such user" });
    }

    // Check if source name exists in the source table
    const source_document = await Source.findOne({ name: "manual" });
    if (!source_document) {
      return res.status(400).json({ error: `Source not found: manual` });
    }

    const sequenceValue = await getNextSequenceValue("unique_id_sequence");

    // Create new lead
    const newLead = await Lead.create({
      date: date,
      sheduled_at: currentDateTime,
      scheduled_to: sheduled_to,
      course_id: course_document._id,
      branch_id: branch_document._id,
      student_id: student_id,
      user_id: user_id,
      source_id: source_document._id,
      reference_number: sequenceValue,
    });

    lead_id = newLead._id;
    // Send success response
    // res.status(200).json(newLead);

    var cid;

    const { leastAllocatedCounselor } =
      await getLeastAndNextLeastAllocatedCounselors(
        course_document._id.toString()
      );

    if (leastAllocatedCounselor) {
      cid = leastAllocatedCounselor._id;

      // Create new counselor assignment
      const newCounsellorAssignment = await CounsellorAssignment.create({
        lead_id: newLead._id,
        counsellor_id: cid,
        assigned_at: date,
      });

      const studentDoc = await Student.findById({ _id: student_id });

      // Update lead with assignment_id
      newLead.assignment_id = newCounsellorAssignment._id;
      newLead.counsellor_id = cid;
      await newLead.save();

      await notificationController.sendNotificationToCounselor(
        cid,
        `You have assigned a new lead belongs to ${studentDoc.email}.`,
        "success"
      );
    } else {
    }
  } catch (error) {
    // Send internal server error response
    res.status(500).json({ error: "Internal Server Error" });
  }

  try {
    // Check if lead exists in the lead table
    if (!mongoose.Types.ObjectId.isValid(lead_id)) {
      return res.status(400).json({ error: "no such lead" });
    }

    // Check if user exists in the user table
    else if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ error: "no such user" });
    }

    const status_document = await Status.findOne({ name: "New" });
    if (!status_document) {
      return res.status(400).json({ error: `Status not found: New` });
    }

    // Current datetime
    let currentDate = new Date();
    const targetTimeZone = "Asia/Colombo"; // Replace with the desired time zone
    const currentDateTime = new Date(
      moment.tz(currentDate, targetTimeZone).format("YYYY-MM-DDTHH:mm:ss[Z]")
    );

    try {
      const newFollowUp = await FollowUp.create({
        lead_id: lead_id,
        user_id: user_id,
        status_id: status_document._id,
        date: currentDateTime,
      });

      const leadDoc = await Lead.findById({ _id: lead_id });
      leadDoc.status_id = status_document._id;
      await leadDoc.save();

      return res.status(200).json(newFollowUp);
    } catch (error) {
      // return res.status(500).json({ error: "Internal Server Error" });
    }
  } catch (e) {}
}

async function getNextSequenceValue(sequenceName) {
  const counter = await Counter.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    { returnOriginal: false, upsert: true }
  );
  return counter.sequence_value;
}

//update lead
async function updateLead(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "No such lead" });
  }

  const lead = await Lead.findByIdAndUpdate(
    { _id: id },
    {
      ...req.body,
    }
  );

  if (!lead) {
    res.status(400).json({ error: "no such lead" });
  }

  res.status(200).json(lead);
}

// get all leads from database (should retrive details that related to referenced tables and latest follwo up status)
async function getLeadsSummaryDetails(req, res) {
  try {
    const leads = await Lead.find()
      .populate("student_id", "name contact_no dob address email nic")
      .populate("course_id", "name")
      .populate("branch_id", "name")
      .populate("source_id", "name")
      .populate("status_id", "name")
      .populate({
        path: "counsellor_id",
        model: "User",
        select: "name",
      })
      .lean()
      .exec();

    // format only the lead.date with formatDate(lead.date)
    const formattedLeads = leads.map((lead) => {
      return {
        ...lead,
        date: formatDate(lead.date),
      };
    });

    res.status(200).json(formattedLeads);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

function formatDate(inputDate) {
  const date = new Date(inputDate);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  const formattedD = `${year}-${month}-${day}`;
  return formattedD;
}
//get one lead
async function getOneLeadSummaryDetails(req, res) {
  const { id } = req.params;
  try {
    const lead = await Lead.findById({ _id: id })
      .populate("course_id", "name")
      .populate("branch_id", "name")
      .exec();

    // Find the latest follow-up for the current lead
    const latestFollowUp = await FollowUp.findOne({ lead_id: id })
      .sort({ date: -1 })
      .populate("status_id", "name")
      .exec();

    const student = await Student.findById({ _id: lead.student_id });

    // Process lead and latest follow-up
    const leadDetail = {
      id: lead._id,
      date: formatDate(lead.date),
      scheduled_at: formatDate(lead.scheduled_at),
      scheduled_to: formatDate(lead.scheduled_to),
      name: student.name,
      contact_no: student.contact_no,
      nic: student.nic,
      dob: formatDate(student.dob),
      email: student.email,
      student_id: student._id,
      address: student.address,
      course: lead.course_id.name,
      branch: lead.branch_id.name,
      status: latestFollowUp
        ? latestFollowUp.status_id
          ? latestFollowUp.status_id.name
          : null
        : null,
      comment: latestFollowUp ? latestFollowUp.comment : null,
    };

    res.status(200).json(leadDetail);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function checkForDuplicate(req, res) {
  const { courseName, branchName, studentNIC } = req.query;

  try {
    // Find the course and branch IDs based on their names
    const course = await Course.findOne({ name: courseName });
    const branch = await Branch.findOne({ name: branchName });

    // Find the student based on name and contact number
    const student = await Student.findOne({ nic: studentNIC });

    if (!course || !branch || !student) {
      return res.status(200).json({
        isDuplicate: false,
        message: "Incomplete information provided.",
      });
    }

    // Check for duplicate lead based on course, branch, and student IDs
    const duplicateLead = await Lead.findOne({
      course_id: course._id,
      branch_id: branch._id,
      student_id: student._id,
    });

    return res.status(200).json({ isDuplicate: !!duplicateLead }); // Returns true if a duplicate lead is found, false otherwise
  } catch (error) {
    // Handle any errors that occur during the process
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getLeastAndNextLeastAllocatedCounselors(productType) {
  try {
    // Fetch all counselors (user_type with name 'Counselor')
    const counselorType = await User_type.findOne({ name: "counselor" });
    const admin_counselorType = await User_type.findOne({
      name: "admin_counselor",
    });
    const counselors = await User.find({
      $or: [
        { user_type: counselorType._id },
        { user_type: admin_counselorType._id },
      ],
    });
    //"these are the counselors",counselors,admin_counselorType._id,counselorType._id);

    // get the status id from status table which is New
    const status = await Status.findOne({ name: "New" });

    // Fetch leads with counselors allocated
    // const leadsWithCounselors = await CounsellorAssignment.find();
    const leadsWithCounselors = await Lead.find({
      assignment_id: { $exists: true },
      status_id: status._id,
    });
    // leadsWithCounselors);

    // Filter counselors based on the specified productType
    const filteredCounselors = counselors.filter((counselor) => {
      return (
        counselor.product_type &&
        counselor.product_type.split(", ").includes(productType)
      );
    });

    // filteredCounselors)

    // Count the number of leads each counselor has
    const counselorLeadCounts = filteredCounselors.map((counselor) => {
      const count = leadsWithCounselors.filter((assignment) => {
        return (
          assignment.counsellor_id &&
          assignment.counsellor_id.equals(counselor._id)
        );
      }).length;
      return { counselor, count };
    });

    // Sort counselors by lead count in ascending order
    counselorLeadCounts.sort((a, b) => a.count - b.count);

    // counselorLeadCounts);

    if (counselorLeadCounts) {
      // Return the least and next least allocated counselors
      const leastAllocatedCounselor = counselorLeadCounts[0]?.counselor || null;
      const nextLeastAllocatedCounselor =
        counselorLeadCounts[1]?.counselor || null;
      //"check", { leastAllocatedCounselor, nextLeastAllocatedCounselor });
      return { leastAllocatedCounselor, nextLeastAllocatedCounselor };
    } else {
      //"No counsellor");
      return null;
    }
  } catch (error) {
    throw error;
  }
}

async function assignLeadsToCounselors() {
  try {
    // Get leads with an assigned lead status
    const leadsWithAssignedStatus = await Lead.find({
      assignment_id: { $exists: true },
      status_id: "65ada2f8da40b8a3e87bda82",
    });

    const leadsToReassign = await Promise.all(
      leadsWithAssignedStatus.map(async (lead) => {
        //find latest counsellor asssgnment for the lead
        const leadLastAssigned = await CounsellorAssignment.findOne({
          lead_id: lead._id,
        })
          .sort({ assigned_at: -1 })
          .exec();
        let currentDate = new Date();
        const targetTimeZone = "Asia/Colombo"; // Replace with the desired time zone
        const currentDateTime = new Date(
          moment
            .tz(currentDate, targetTimeZone)
            .format("YYYY-MM-DDTHH:mm:ss[Z]")
        );
        const currentTime = currentDateTime.getUTCHours();

        // if (statusChangedTime.getHours() + threshold < endTime) {
        //   return null
        // }

        const addedTime = leadLastAssigned.assigned_at.getUTCHours();
        //addedTime,currentTime)

        //Check leads came after 17h to 8h
        if (!(addedTime >= startTime && addedTime <= endTime)) {
          if (Math.abs(currentTime - startTime) >= threshold) {
            //leadLastAssigned.assigned_at,addedTime,currentTime,currentDateTime)
            return lead;
          } else {
            return null;
          }
        }

        const CurrentDateCounterPart = moment
          .utc(currentDateTime)
          .startOf("day");

        // Get date from the timestamp
        const AddedDateCounterPart = moment
          .utc(leadLastAssigned.assigned_at)
          .startOf("day");

        //leadLastAssigned.assigned_at,addedTime,AddedDateCounterPart,currentTime,currentDateTime,CurrentDateCounterPart,CurrentDateCounterPart.isSame(AddedDateCounterPart))

        //Check leads came before 17h but not filled with 4h threshold
        if (!CurrentDateCounterPart.isSame(AddedDateCounterPart)) {
          if (Math.abs(addedTime - endTime) <= threshold) {
            if (
              Math.abs(addedTime - endTime) +
                Math.abs(currentTime - startTime) >=
              threshold
            ) {
              return lead;
            } else {
              return null;
            }
          }
        }

        //Other normal flow
        if (Math.abs(currentTime - addedTime) >= threshold) {
          return lead;
        } else {
          return null;
        }
      })
    );
    // Remove null values from the leadsToReassign array
    const filteredLeadsToReassign = leadsToReassign.filter(
      (lead) => lead !== null
    );

    // File path
    const filePath = "filtered_leads4.txt";

    // Write data to the file
    fs.writeFile(filePath, JSON.stringify(filteredLeadsToReassign), (err) => {
      if (err) {
        return;
      }
    });

    const filePath2 = "original_new_leads4.txt";

    // Write data to the file
    fs.writeFile(filePath2, JSON.stringify(leadsWithAssignedStatus), (err) => {
      if (err) {
        return;
      }
    });

    // Assign leads to counselors
    for (const lead of filteredLeadsToReassign) {
      //find latest counsellor assignment for the lead
      const latestAssignment = await CounsellorAssignment.findOne({
        lead_id: lead._id,
      })
        .sort({ assigned_at: -1 })
        .exec();
      const leadDoc = await Lead.findOne({ _id: lead._id }).populate(
        "student_id",
        "email"
      );

      await notificationController.sendNotificationToCounselor(
        latestAssignment.counsellor_id,
        `The lead belongs to ${leadDoc.student_id.email} has been revoked from you.`,
        "error"
      );

      // Get the least and next least allocated counselors
      const { leastAllocatedCounselor, nextLeastAllocatedCounselor } =
        await getLeastAndNextLeastAllocatedCounselors(
          lead.course_id.toString()
        );

      //check if the lead allocated to same counselor
      if (
        latestAssignment.counsellor_id &&
        latestAssignment.counsellor_id.equals(leastAllocatedCounselor)
      ) {
        try {
          const currentDate = new Date();
          const targetTimeZone = "Asia/Colombo"; // Replace with the desired time zone
          const currentDateTime = new Date(
            moment
              .tz(currentDate, targetTimeZone)
              .format("YYYY-MM-DDTHH:mm:ss[Z]")
          );

          //create new counsellor assignment
          const counsellorAssignment = await CounsellorAssignment.create({
            lead_id: lead._id,
            counsellor_id: nextLeastAllocatedCounselor._id,
            assigned_at: currentDateTime,
          });
          // Update lead with assignment_id
          lead.assignment_id = counsellorAssignment._id;
          lead.counsellor_id = nextLeastAllocatedCounselor._id;
          await lead.save();

          await notificationController.sendNotificationToCounselor(
            nextLeastAllocatedCounselor._id,
            `You have assigned a new lead belongs to ${leadDoc.student_id.email}.`,
            "success"
          );
        } catch (error) {}
      } else {
        //if the counsello is different
        try {
          const currentDate = new Date();
          const targetTimeZone = "Asia/Colombo"; // Replace with the desired time zone
          const currentDateTime = new Date(
            moment
              .tz(currentDate, targetTimeZone)
              .format("YYYY-MM-DDTHH:mm:ss[Z]")
          );

          // Create new counsellor assignment
          const counsellorAssignment = await CounsellorAssignment.create({
            lead_id: lead._id,
            counsellor_id: leastAllocatedCounselor._id,
            assigned_at: currentDateTime,
          });

          // Update lead with assignment_id
          lead.assignment_id = counsellorAssignment._id;
          lead.counsellor_id = leastAllocatedCounselor._id;
          await lead.save();

          // Check if leadDoc.student_id is defined before accessing its properties
          if (leadDoc.student_id && leadDoc.student_id.email) {
            await notificationController.sendNotificationToCounselor(
              leastAllocatedCounselor._id,
              `You have been assigned a new lead belonging to ${leadDoc.student_id.email}.`,
              "success"
            );
          } else {
          }
        } catch (error) {}
      }
    }
  } catch (error) {
    throw error;
  }
}

async function assignLeadsToCounselorsTest(req, res) {
  const startTime = 8;
  const endTime = 17;
  const threshold = 4;
  const { added_time, current_time } = req.body;
  const addedTime = added_time;
  const currentTime = current_time;

  //Check leads came after 17h to 8h
  if (!(addedTime >= startTime && addedTime <= endTime)) {
    if (Math.abs(currentTime - startTime) >= threshold) {
      res.status(200).json("reassigned");
      return;
    } else {
      res.status(200).json("not reassigned");
      return;
    }
  }
  //Check leads came before 17h but not filled with 4h threshold
  if (Math.abs(addedTime - endTime) <= 4) {
    if (
      Math.abs(addedTime - endTime) + Math.abs(currentTime - startTime) >=
      threshold
    ) {
      res.status(200).json("reassigned");
      return;
    } else {
      res.status(200).json("not reassigned");
      return;
    }
  }

  //Other normal flow
  if (Math.abs(currentTime - addedTime) >= threshold) {
    res.status(200).json("reassigned");
    return;
  } else {
    res.status(200).json("not reassigned");
    return;
  }
}

// async function scheduleNextExecution() {
//   let currentDate = new Date();
//   const targetTimeZone = "Asia/Colombo"; // Replace with the desired time zone
//   const currentDateTime = new Date(
//     moment.tz(currentDate, targetTimeZone).format("YYYY-MM-DDTHH:mm:ss[Z]")
//   );
//   const currentHour = currentDateTime.getUTCHours();
//   // Check if the current time is between 8 am and 5 pm
//   if (currentHour >= startTime && currentHour <= endTime) {
//     // Call the function every minute
//     setInterval(() => {
//       assignLeadsToCounselors();
//     }, 1200000);
//     //1200000
//   } else {
//   }

//   // Schedule the next check after 1 hour
//   setTimeout(scheduleNextExecution, 3600000); // 1 hour in milliseconds
// }

// Schedule the cron job to run every minute
cron.schedule("*/30 * * * *", () => {
  let currentDate = new Date();
  const targetTimeZone = "Asia/Colombo"; // Replace with the desired time zone
  const currentDateTime = new Date(
    moment.tz(currentDate, targetTimeZone).format("YYYY-MM-DDTHH:mm:ss[Z]")
  );
  const currentHour = currentDateTime.getUTCHours();
  // Check if the current time is between 8 am and 5 pm
  if (currentHour >= startTime && currentHour <= endTime) {
    // Call the function every minute
    console.log(currentDateTime, " - Lead auto allocation job executed.");
    assignLeadsToCounselors();
    //1200000
  } else {
    console.log(
      currentDateTime,
      " - The auto allocation is sleeping now it will start again between the working hours."
    );
  }
});

module.exports = {
  getLeads,
  addLead,
  getLead,
  updateLead,
  getLeadsSummaryDetails,
  checkForDuplicate,
  getOneLeadSummaryDetails,
  getLeastAndNextLeastAllocatedCounselors,
  assignLeadsToCounselorsTest,
  restoreLead,
  addLeadWithExistingStudent,
  bulkImport,
  archiveLeads,
  assignLeadsToCounselors,
};
