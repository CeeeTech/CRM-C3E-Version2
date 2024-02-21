require("dotenv").config();
const axios = require("axios");
const Lead = require("../models/lead");
const Course = require("../models/course");
const Branch = require("../models/branch");
const Status = require("../models/status");
const Student = require("../models/student");
const FbLeadForm = require("../models/fbLeadForm");
const Source = require("../models/source");
const FollowUp = require("../models/followUp");
const Counter = require("../models/counter");
const { default: mongoose } = require("mongoose");
const User = require("../models/user");
const FACEBOOK_PAGE_ACCESS_TOKEN =
  "EAAMA0sfsBzABOzkRn8DWHhFMb44hIiovUWUK6gSC7hFwZCMcGskm7f3BZCZCk8Aa7mVU0aaqSGvFhVzJJjDgJN3fMo2wZBrJWMZAPVellre5tpm0TKdRLnXeMhBv2xNqzknZC3f9Y57XoLxcvBfZBCATuEkUmBHWRsywAlS9WWiZCM6BC5EeElv9ukSBV5fmHZAYZBBymZCxV1X0uACDQBf";
const notificationController = require("../controllers/notificationController");
const CounsellorAssignment = require("../models/counsellorAssignment");
const leadsController = require("../controllers/leadController");
const moment = require("moment-timezone");

async function getFBLeadsHealth(req, res) {
  try {
    let response = {};
    const uniqueInstantForms = await FbLeadForm.distinct("form_id");
    response.instant_forms = uniqueInstantForms;

    let instantFormResponsesArray = [];
    let localInstantFormLeadsArray = [];
    let listOfInstantFormNames = [];

    for (const uniqueInstantForm of uniqueInstantForms) {
      var instantFormInstance = await axios.get(
        `https://graph.facebook.com/v18.0/${uniqueInstantForm}/leads/?access_token=${FACEBOOK_PAGE_ACCESS_TOKEN}&limit=1000`
      );
      const localInstantFormLeadsCount = await FbLeadForm.countDocuments({
        form_id: uniqueInstantForm,
      });
      var formMetaData = await axios.get(
        `https://graph.facebook.com/v18.0/${uniqueInstantForm}/?access_token=${FACEBOOK_PAGE_ACCESS_TOKEN}&limit=1000`
      );

      //(formMetaData.data.name)

      localInstantFormLeadsArray.push(localInstantFormLeadsCount);
      instantFormResponsesArray.push(instantFormInstance.data.data.length);
      listOfInstantFormNames.push(formMetaData.data.name);
    }
    response.instant_form_names = listOfInstantFormNames;
    response.instant_forms_values = instantFormResponsesArray;
    response.local_instant_forms_values = localInstantFormLeadsArray;

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: "Internal Server Error" });
  }
}

//get all leads
async function getLeads(req, res) {
  // Facebook sends a GET request
  // To verify that the webhook is set up
  // properly, by sending a special challenge that
  // we need to echo back if the "verify_token" is as specified
  if (req.query["hub.verify_token"] === "CRM_WEBHOOK_VERIFY_TOKEN") {
    res.send(req.query["hub.challenge"]);
  }
}

async function postLeads(req, res) {
  // Facebook will be sending an object called "entry" for "leadgen" webhook event
  if (!req.body.entry) {
    return res.status(500).send({ error: "Invalid POST data received" });
  }

  // Travere entries & changes and process lead IDs
  for (const entry of req.body.entry) {
    for (const change of entry.changes) {
      // Process new lead (leadgen_id)
      await processNewLead(change.value.leadgen_id, change.value.form_id);
    }
  }

  // Success
  res.send({ success: true });
}

async function processNewLead(leadId, formId) {
  let response;

  try {
    // Get lead details by lead ID from Facebook API
    response = await axios.get(
      `https://graph.facebook.com/v18.0/${leadId}/?access_token=${FACEBOOK_PAGE_ACCESS_TOKEN}`
    );
  } catch (err) {
    // Log errors
    return console.warn(
      `An invalid response was received from the Facebook API:`
    );
  }

  // Ensure valid API response returned
  if (
    !response.data ||
    (response.data && (response.data.error || !response.data.field_data))
  ) {
    return console.warn(
      `An invalid response was received from the Facebook API`
    );
  }

  // Lead fields
  const leadForm = {};

  // Extract fields
  for (const field of response.data.field_data) {
    const fieldName = field.name;
    const fieldValue = field.values[0];
    leadForm[fieldName] = fieldValue;
  }
  const {
    full_name,
    email,
    phone_number,
    date_of_birth,
    course_you_are_looking_for,
  } = leadForm;
  let course_var;
  if (course_you_are_looking_for) {
    course_var = course_you_are_looking_for;
  } else {
    const { degree_you_are_looking_for } = leadForm;
    if (degree_you_are_looking_for) {
      course_var = degree_you_are_looking_for;
    } else {
      const { programme_you_are_looking_for } = leadForm;
      if (programme_you_are_looking_for) {
        course_var = programme_you_are_looking_for;
      } else {
        course_var = null;
      }
    }
  }
  var student_id;
  let date_of_birth_to_add;
  if (date_of_birth == "NaN-NaN-NaN") {
    date_of_birth_to_add = null;
  } else {
    date_of_birth_to_add = date_of_birth;
  }
  try {
    const existingStudent = await Student.findOne({ email: email });
    if (existingStudent) {
      student_id = existingStudent._id;
    } else {
      const newStudent = await Student.create({
        name: full_name,
        dob: date_of_birth_to_add,
        contact_no: phone_number,
        email: email,
      });
      student_id = newStudent._id;
    }
  } catch (error) {
    (error);
  }
  await addLead(student_id, course_var, formId, leadId);
}

async function addLead(student_id, course_name, formId, leadId) {
  try {
    let currentDate = new Date();
    const targetTimeZone = "Asia/Colombo"; // Replace with the desired time zone
    const date = new Date(
      moment.tz(currentDate, targetTimeZone).format("YYYY-MM-DDTHH:mm:ss[Z]")
    );

    // Check if course_name exists in the course table
    let course_document = await Course.findOne({ course_code: course_name });
    if (!course_document) {
      course_document = await Course.findOne({ course_code: "other" });
    }

    // Fetch the Branch
    branch_document = await Branch.findOne({ name: "Other" });

    // Check if student exists in the student table
    if (!mongoose.Types.ObjectId.isValid(student_id)) {
      return;
    }

    // Check if source name exists in the source table
    const source_document = await Source.findOne({ name: "facebook" });
    if (!source_document) {
      return;
    }

    const sequenceValue = await getNextSequenceValue("unique_id_sequence");

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
      reference_number: sequenceValue,
    });

    // Add FB Lead Instant Form ID to a seperate folder for loging
    const newFbLeadFormEntry = await FbLeadForm.create({
      created_at: date,
      lead_id: newLead._id,
      form_id: formId,
      fb_lead_id: leadId,
    });

    const { leastAllocatedCounselor } =
      await leadsController.getLeastAndNextLeastAllocatedCounselors(
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

      const newFollowUp = await addFollowUp(newLead._id, cid, status._id);

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
      console.log(date,' - FB automated lead added with counselor .');

    } else {

      const status = await Status.findOne({ name: "New" });

      const newFollowUp = await addFollowUp(
        newLead._id,
        null,
        status._id,
        date
      );
      console.log(date,' - FB automated lead added withot counselor .');

      return "added_without_counselor";
    }
  } catch (error) {
    return "error adding lead";
  }
}

async function addFollowUp(lead_id, user_id, status) {
  // Check if lead exists in the lead table
  if (!mongoose.Types.ObjectId.isValid(lead_id)) {
    return "No such a lead to add followup";
  }

  // Check if status exists in the status table; the passed status is the id of the status
  else if (!mongoose.Types.ObjectId.isValid(status)) {
    return "No such a status to add followup";
  }

  // Check if user exists in the user table
  else if (!mongoose.Types.ObjectId.isValid(user_id)) {
    return "No such a user to add followup";
  }

  // Current datetime

  let currentDateNow = new Date();
  const targetTimeZone = "Asia/Colombo"; // Replace with the desired time zone
  const currentDateTime = new Date(
    moment.tz(currentDateNow, targetTimeZone).format("YYYY-MM-DDTHH:mm:ss[Z]")
  );

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
  } catch (error) {
    return "error adding followup";
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

module.exports = {
  getLeads,
  postLeads,
  getFBLeadsHealth,
};
