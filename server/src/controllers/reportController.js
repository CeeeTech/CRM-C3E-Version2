const Report = require("../models/report");
const Lead = require("../models/lead");
const Course = require("../models/course");
const User = require("../models/user");
const Logs = require("../models/log");
const mongoose = require("mongoose");

async function getAllReports(req, res) {
  try {
    const reports = await Report.find();
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Function to group dataset by month and count occurrences
function groupLeadsByMonth(data) {
  // Create an object with all months initialized to 0
  const monthCounts = {
    January: 0,
    February: 0,
    March: 0,
    April: 0,
    May: 0,
    June: 0,
    July: 0,
    August: 0,
    September: 0,
    October: 0,
    November: 0,
    December: 0,
  };

  // Update counts for existing months based on the data
  data.forEach((item) => {
    const month = new Date(item.date).toLocaleString("default", {
      month: "long",
    });
    monthCounts[month]++;
  });

  return monthCounts;
}

// Controller function to fetch leads
async function fetchLeads(req, res) {
  try {
    const leads = await Lead.find();
    const groupedLeads = groupLeadsByMonth(leads);
    res.status(200).json(groupedLeads);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Controller function to fetch Module Interaction
async function fetchInteraction(req, res) {
  try {
    const leads = await Lead.find();
    const courses = await Course.find();
    const users = await User.find();

    const leadCount = leads.length;
    const courseCount = courses.length;
    const userCount = users.length;

    res.json({
      courseCount,
      userCount,
      leadCount,
    });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function sourceCount(req, res) {
  try {
    const leads = await Lead.find().populate("source_id", "name"); // Populate source name

    // Create an empty object to store source name counts
    const sourceNameCounts = {};

    // Iterate through each lead
    leads.forEach((lead) => {
      if (lead.source_id && lead.source_id.name) {
        const sourceName = lead.source_id.name; // Access source name from populated data

        // Check if source name already exists in counts
        if (sourceNameCounts[sourceName]) {
          sourceNameCounts[sourceName]++;
        } else {
          sourceNameCounts[sourceName] = 1;
        }
      } else {
        console.warn("Lead with no source name:", lead);
      }
    });

    res.status(200).json(sourceNameCounts);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Controller function to fetch Module Interaction
async function fetchInteractionByCounsellor(req, res) {
  try {
    const { counsellor_id } = req.params;

    // Fetch leads, courses, and users based on the counsellor_id
    const leads = await Lead.find({ counsellor_id });
    const courses = await Course.find({ counsellor_id });
    const users = await User.find({ counsellor_id });

    const leadCount = leads.length;
    const courseCount = courses.length;
    const userCount = users.length;

    res.json({
      courseCount,
      userCount,
      leadCount,
    });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function countFunctionNames(req, res) {
  try {
    // Fetch logs data
    const logs = await Logs.find();

    // Initialize an object to store module counts
    const moduleCounts = {};

    // Iterate through logs to count occurrences of each functionName
    logs.forEach((log) => {
      const functionName = log.functionName;

      if (functionName) {
        // Increment the count for the module
        if (moduleCounts[functionName]) {
          moduleCounts[functionName]++;
        } else {
          moduleCounts[functionName] = 1;
        }
      }
    });

    res.status(200).json(moduleCounts);
  } catch (error) {
    console.log("Error counting module names:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function countFunctionNamesbyCounsellor(req, res) {
  try {
    // Extract counsellor_id from the request
    const { counsellor_id } = req.body;

    // Fetch logs data for the specified counsellor_id
    const logs = await Logs.find({ userId: counsellor_id });

    // Initialize an object to store module counts
    const funcCounts = {};

    // Iterate through logs to count occurrences of each functionName
    logs.forEach((log) => {
      const functionName = log.functionName;

      if (functionName) {
        // Increment the count for the module
        if (funcCounts[functionName]) {
          funcCounts[functionName]++;
        } else {
          funcCounts[functionName] = 1;
        }
      }
    });

    res.status(200).json(funcCounts);
  } catch (error) {
    console.log("Error counting module names:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getAllReports,
  fetchLeads,
  fetchInteraction,
  sourceCount,
  fetchInteractionByCounsellor,
  countFunctionNames,
  countFunctionNamesbyCounsellor,
};
