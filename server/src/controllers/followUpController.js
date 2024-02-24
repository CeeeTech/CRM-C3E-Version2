const { default: mongoose } = require("mongoose");
const FollowUp = require("../models/followUp");
const Status = require("../models/status");
const User = require("../models/user");
const Lead = require("../models/lead");
const moment = require("moment-timezone");
console.log;
//get all followUps
async function getFollowUps(req, res) {
  try {
    const follow_up = await FollowUp.find();
    res.status(200).json(follow_up);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//add new followup
async function addFollowUp(req, res) {
  const { lead_id, user_id, status, comment } = req.body;

  // Check if lead exists in the lead table
  if (!mongoose.Types.ObjectId.isValid(lead_id)) {
    return res.status(400).json({ error: "no such lead" });
  }

  // Check if status exists in the status table; the passed status is the id of the status
  // else if (!mongoose.Types.ObjectId.isValid(status)) {
  //   return res.status(400).json({ error: "no such status" });
  // }

  // Check if user exists in the user table
  else if (!mongoose.Types.ObjectId.isValid(user_id)) {
    return res.status(400).json({ error: "no such user" });
  }
  const statusdoc = await Status.findOne({ name: status });
  if (!statusdoc) {
    return res.status(400).json({ error: "no such status" });
  }

  let date = new Date();

  // Current datetime
  const targetTimeZone = "Asia/Colombo"; // Replace with the desired time zone
  const customDateUTC = new Date(
    moment.tz(date, targetTimeZone).format("YYYY-MM-DDTHH:mm:ss[Z]")
  ); // Replace with your desired date and time in UTC

  try {
    const newFollowUp = await FollowUp.create({
      lead_id: lead_id,
      user_id: user_id,
      status_id: statusdoc._id,
      comment,
      date: customDateUTC,
    });

    const leadDoc = await Lead.findById({ _id: lead_id });
    leadDoc.status_id = statusdoc._id;
    await leadDoc.save();

    return res.status(200).json(newFollowUp);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

//update followup
async function updateFollowUp(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: "no such follow up" });
  }

  const followup = await FollowUp.findByIdAndUpdate(
    { _id: id },
    {
      ...req.body,
    }
  );

  if (!followup) {
    res.status(400).json({ error: "no such follow up" });
  }

  const leadId = req.body.lead_id;
  const status = req.body.status;
  const leadDoc = await Lead.findById({ _id: leadId });
  leadDoc.status_id = status;
  await leadDoc.save();

  res.status(200).json(followup);
}

//get followup
async function getFollowUp(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "No such followup" });
  }

  const followup = await FollowUp.findById({ _id: id });

  if (!followup) {
    res.status(400).json({ error: "No such followup" });
  }

  res.status(200).json(followup);
}

function formatDate(inputDate) {
  const date = new Date(inputDate);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  const formattedD = `${year}-${month}-${day}`;
  return formattedD;
}

async function getFollowUpsByLead(req, res) {
  const { lead_id } = req.params;

  try {
    const followUps = await FollowUp.find({ lead_id })
      // Remove or modify the sort to change the order
      // .sort({ date: -1 })
      .exec();

    const followUpDetails = [];

    for (const followUp of followUps) {
      const user = await User.findOne({ _id: followUp.user_id });
      const status = await Status.findOne({ _id: followUp.status_id });
      const followupDetail = {
        comment: followUp.comment,
        date: formatDate(followUp.date),
        status: status ? status.name : null,
        user: user ? user.name : null,
      };

      followUpDetails.push(followupDetail);
    }
    res.status(200).json(followUpDetails);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//get followup by lead id leatest date
async function getFollowUpDate(req, res) {
  try {
    const follow_up = await FollowUp.find().populate("status_id").exec();

    // Grouping follow_up data based on lead_id
    const groupedFollowUp = follow_up.reduce((acc, followUpItem) => {
      const leadId = followUpItem.lead_id;

      if (!acc[leadId]) {
        acc[leadId] = [];
      }

      acc[leadId].push(followUpItem);
      return acc;
    }, {});

    // Filtering the latest date within each group
    const filteredFollowUp = Object.keys(groupedFollowUp).reduce(
      (result, leadId) => {
        const group = groupedFollowUp[leadId];
        const latestItem = group.reduce((latest, currentItem) => {
          return latest.date > currentItem.date ? latest : currentItem;
        });

        result[leadId] = latestItem;
        return result;
      },
      {}
    );

    // Counting the number of items with name
    const ringNoAnswerCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Ring no answer"
    ).length;
    const registeredCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Registered"
    ).length;
    const emailCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Sent Email"
    ).length;
    const whatsappCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Whatsapp & sms"
    ).length;
    const meetingCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Scheduled meeting"
    ).length;
    const cousedetailsCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Course details sent"
    ).length;
    const nextintakeCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Next intake"
    ).length;
    const droppedCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Dropped"
    ).length;
    const fakeCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Fake"
    ).length;
    const duplicateCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Duplicate"
    ).length;
    const NewCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "New"
    ).length;

    const resultCount = {
      ringNoAnswerCount: ringNoAnswerCount,
      registeredCount: registeredCount,
      emailCount: emailCount,
      whatsappCount: whatsappCount,
      meetingCount: meetingCount,
      cousedetailsCount: cousedetailsCount,
      nextintakeCount: nextintakeCount,
      droppedCount: droppedCount,
      fakeCount: fakeCount,
      duplicateCount: duplicateCount,
      NewCount: NewCount,
    };

    // console.log(resultCount);

    res.status(200).json(resultCount);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// get folloup by lead id leatest date by user id
async function getFollowUpDateByUser(req, res) {
  const { user_id } = req.params;
  try {
    const follow_up = await FollowUp.find({ user_id })
      .populate("status_id")
      .exec();

    // Grouping follow_up data based on lead_id
    const groupedFollowUp = follow_up.reduce((acc, followUpItem) => {
      const leadId = followUpItem.lead_id;

      if (!acc[leadId]) {
        acc[leadId] = [];
      }

      acc[leadId].push(followUpItem);
      return acc;
    }, {});

    // Filtering the latest date within each group
    const filteredFollowUp = Object.keys(groupedFollowUp).reduce(
      (result, leadId) => {
        const group = groupedFollowUp[leadId];
        const latestItem = group.reduce((latest, currentItem) => {
          return latest.date > currentItem.date ? latest : currentItem;
        });

        result[leadId] = latestItem;
        return result;
      },
      {}
    );

    // Counting the number of items with name
    const ringNoAnswerCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Ring no answer"
    ).length;
    const registeredCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Registered"
    ).length;
    const emailCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Sent Email"
    ).length;
    const whatsappCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Whatsapp & sms"
    ).length;
    const meetingCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Scheduled meeting"
    ).length;
    const cousedetailsCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Course details sent"
    ).length;
    const nextintakeCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Next intake"
    ).length;
    const droppedCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Dropped"
    ).length;
    const fakeCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Fake"
    ).length;
    const duplicateCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Duplicate"
    ).length;
    const NewCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "New"
    ).length;

    const resultCount = {
      ringNoAnswerCount: ringNoAnswerCount,
      registeredCount: registeredCount,
      emailCount: emailCount,
      whatsappCount: whatsappCount,
      meetingCount: meetingCount,
      cousedetailsCount: cousedetailsCount,
      nextintakeCount: nextintakeCount,
      droppedCount: droppedCount,
      fakeCount: fakeCount,
      duplicateCount: duplicateCount,
      NewCount: NewCount,
    };

    // console.log(resultCount);

    res.status(200).json(resultCount);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getFollowUpDate(req, res) {
  try {
    let followUps;

    followUps = await Lead.find().populate("status_id").exec();
    // console.log("counsellor exec", followUps);

    // Counting the number of items with each status dynamically
    const resultCount = followUps.reduce((count, followUpItem) => {
      const statusName = followUpItem.status_id?.name;
      count[statusName + "Count"] = (count[statusName + "Count"] || 0) + 1;
      return count;
    }, {});

    const finalResult = {
      ringNoAnswerCount: resultCount["Ring no answerCount"] || 0,
      registeredCount: resultCount["RegisteredCount"] || 0,
      emailCount: resultCount["Sent EmailCount"] || 0,
      whatsappCount: resultCount["Whatsapp & smsCount"] || 0,
      meetingCount: resultCount["Scheduled meetingCount"] || 0,
      cousedetailsCount: resultCount["Course details sentCount"] || 0,
      nextintakeCount: resultCount["Next intakeCount"] || 0,
      droppedCount: resultCount["DroppedCount"] || 0,
      fakeCount: resultCount["FakeCount"] || 0,
      duplicateCount: resultCount["DuplicateCount"] || 0,
      NewCount: resultCount["NewCount"] || 0,
    };

    res.status(200).json(finalResult);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getCounselorFollowUpStatusCount(req, res) {
  const { user_id, user_type } = req.query;

  try {
    let followUps;

    if (user_type == "counselor") {
      followUps = await Lead.find({ counsellor_id: user_id })
        .populate("status_id")
        .exec();
      // console.log("counsellor exec", followUps);
    } else {
      followUps = await Lead.find({ user_id: user_id })
        .populate("status_id")
        .exec();
    }

    // Counting the number of items with each status dynamically
    const resultCount = followUps.reduce((count, followUpItem) => {
      const statusName = followUpItem.status_id?.name;
      count[statusName + "Count"] = (count[statusName + "Count"] || 0) + 1;
      return count;
    }, {});

    const finalResult = {
      ringNoAnswerCount: resultCount["Ring no answerCount"] || 0,
      registeredCount: resultCount["RegisteredCount"] || 0,
      emailCount: resultCount["Sent EmailCount"] || 0,
      whatsappCount: resultCount["Whatsapp & smsCount"] || 0,
      meetingCount: resultCount["Scheduled meetingCount"] || 0,
      cousedetailsCount: resultCount["Course details sentCount"] || 0,
      nextintakeCount: resultCount["Next intakeCount"] || 0,
      droppedCount: resultCount["DroppedCount"] || 0,
      fakeCount: resultCount["FakeCount"] || 0,
      duplicateCount: resultCount["DuplicateCount"] || 0,
      NewCount: resultCount["NewCount"] || 0,
    };

    res.status(200).json(finalResult);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getFollowUps,
  addFollowUp,
  updateFollowUp,
  getFollowUp,
  getFollowUpsByLead,
  getFollowUpDate,
  getFollowUpDateByUser,
  getCounselorFollowUpStatusCount,
};
