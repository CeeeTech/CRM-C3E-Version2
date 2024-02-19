const CounsellorAssignment = require("../models/counsellorAssignment");
const Lead = require("../models/lead");
const Student = require("../models/student");
const mongoose = require("mongoose");
const notificationController = require("../controllers/notificationController");
const { ObjectId } = mongoose.Types;
const leadStatusToCheck = "65ada2f8da40b8a3e87bda82";
const moment = require("moment-timezone");

async function assignLeadToCounsellor(req, res) {
  const { counsellor_id, lead_id } = req.body;
  try {
    // Current datetime
    let currentDate = new Date();
    const targetTimeZone = "Asia/Colombo"; // Replace with the desired time zone
    const currentDateTime = new Date(
      moment.tz(currentDate, targetTimeZone).format("YYYY-MM-DDTHH:mm:ss[Z]")
    );

    // If counsellor_id is not valid or is null, find the counselor with the least assigned leads
    let selectedCounsellorId = counsellor_id;
    if (!mongoose.Types.ObjectId.isValid(counsellor_id) || !counsellor_id) {
      // Your logic to select the counselor with the least assigned leads goes here
      // For example:
      const leastAllocatedCounselor = await findCounselorWithLeastAssignedLeads();
      selectedCounsellorId = leastAllocatedCounselor._id;
    }

    if (!mongoose.Types.ObjectId.isValid(lead_id)) {
      return res.status(404).json({ error: "No such lead" });
    }

    const LatestCounsellorAssignment = await CounsellorAssignment.findOne({
      lead_id: lead_id,
    })
      .sort({ assigned_at: -1 })
      .exec();
    const lastAssignedCounsellorId = LatestCounsellorAssignment?.counsellor_id;

    const leadDoc = await Lead.findOne({ _id: lead_id }).populate(
      "student_id",
      "email"
    );

    if (lastAssignedCounsellorId) {
      await notificationController.sendNotificationToCounselor(
        lastAssignedCounsellorId,
        `The lead belongs to ${leadDoc.student_id.email} has been revoked from you.`,
        "error"
      );
    }

    const counsellorAssignment = await CounsellorAssignment.create({
      lead_id: lead_id,
      counsellor_id: selectedCounsellorId,
      assigned_at: currentDateTime,
    });

    await notificationController.sendNotificationToCounselor(
      selectedCounsellorId,
      `You have assigned a new lead belongs to ${leadDoc.student_id.email}.`,
      "success"
    );

    const lead = await Lead.findById(lead_id);

    // Update lead with assignment_id
    lead.assignment_id = counsellorAssignment._id;
    lead.counsellor_id = selectedCounsellorId;
    await lead.save();

    res.status(200).json(counsellorAssignment);
  } catch (error) {
    console.error("Error assigning lead to counselor:", error);
    res.status(400).json({ error: error.message });
  }
}

async function getBumpedLeads(req, res) {
  try {
    const firstBumpedLeads = await CounsellorAssignment.aggregate([
      {
        $group: {
          _id: "$lead_id",
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $eq: 2 },
        },
      },
    ]);
    const firstBumpedLeadCount = firstBumpedLeads.length;

    const secondBumpedLeads = await CounsellorAssignment.aggregate([
      {
        $group: {
          _id: "$lead_id",
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $eq: 3 },
        },
      },
    ]);
    const secondBumpedLeadCount = secondBumpedLeads.length;

    const ciricalLeads = await CounsellorAssignment.aggregate([
      {
        $group: {
          _id: "$lead_id",
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gt: 3 },
        },
      },
      {
        $lookup: {
          from: "follow_up",
          localField: "_id",
          foreignField: "lead_id",
          as: "followUps",
        },
      },
      {
        $unwind: "$followUps",
      },
      {
        $match: {
          "followUps.status_id": new ObjectId(leadStatusToCheck),
        },
      },
      {
        $group: {
          _id: "$_id",
          count: { $first: "$count" },
        },
      },
    ]);
    const criticalLeadCount = ciricalLeads.length;

    const bumps = {
      first: firstBumpedLeadCount,
      second: secondBumpedLeadCount,
      critical: criticalLeadCount,
    };

    res.status(200).json(bumps);
  } catch (error) {
    console.error("Error getting bumped lead count:", error);
    throw error;
  }
}

module.exports = {
  assignLeadToCounsellor,
  getBumpedLeads,
};
