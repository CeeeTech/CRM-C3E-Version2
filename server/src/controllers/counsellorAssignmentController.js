const CounsellorAssignment = require("../models/counsellorAssignment");
const Lead = require("../models/lead");
const Student = require("../models/student");
const mongoose = require("mongoose");
const notificationController = require("../controllers/notificationController");
const { ObjectId } = mongoose.Types;
const leadStatusToCheck = "65ada2f8da40b8a3e87bda82";

async function assignLeadToCounsellor(req, res) {
  const { counsellor_id, lead_id } = req.body;
  try {
    // Current datetime
    let currentDate = new Date();
    const targetTimeZone = "Asia/Colombo"; // Replace with the desired time zone
    const currentDateTime = new Date(
      moment.tz(currentDate, targetTimeZone).format("YYYY-MM-DDTHH:mm:ss[Z]")
    );
    if (!mongoose.Types.ObjectId.isValid(counsellor_id)) {
      res.status(404).json({ error: "No such counsellor" });
    }
    if (!mongoose.Types.ObjectId.isValid(lead_id)) {
      res.status(404).json({ error: "No such lead" });
    } else {
      const LatestCounsellorAssignment = await CounsellorAssignment.findOne({
        lead_id: lead_id,
      })
        .sort({ assigned_at: -1 })
        .exec();
      const latAssignedCounsellor = LatestCounsellorAssignment.counsellor_id;

      const leadDoc = await Lead.findOne({ _id: lead_id }).populate(
        "student_id",
        "email"
      );

      console.log("notification was called");
      await notificationController.sendNotificationToCounselor(
        latAssignedCounsellor,
        `The lead belongs to ${leadDoc.student_id.email} has been revoked from you.`,
        "error"
      );
      console.log("notification was called after");

      const counsellorAssignment = await CounsellorAssignment.create({
        lead_id: lead_id,
        counsellor_id: counsellor_id,
        assigned_at: currentDateTime,
      });

      console.log("notification was called");
      await notificationController.sendNotificationToCounselor(
        counsellor_id,
        `You have assigned a new lead belongs to ${leadDoc.student_id.email}.`,
        "success"
      );
      console.log("notification was called after");

      res.status(200).json(counsellorAssignment);

      const lead = await Lead.findById(lead_id);

      // Update lead with assignment_id
      lead.assignment_id = counsellorAssignment._id;
      lead.counsellor_id = counsellor_id;
      await lead.save();

      console.log("lead", lead);
      console.log("assignment", counsellorAssignment);
    }
  } catch (error) {
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
    console.log(firstBumpedLeads);
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
    console.log(secondBumpedLeads);
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
    console.log(ciricalLeads);
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
