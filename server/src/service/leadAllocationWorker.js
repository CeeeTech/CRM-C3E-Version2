const Lead = require("../models/lead");
const Course = require("../models/course");
const Status = require("../models/status");
const Branch = require("../models/branch");
const Source = require("../models/source");
const Student = require("../models/student");
const FollowUp = require("../models/followUp");
const User_type = require("../models/user_type");
const CounsellorAssignment = require("../models/counsellorAssignment");
const Counter = require("../models/counter");
const LeadArchived = require("../models/lead_archived");
const FollowUpArchived = require("../models/followUp_archived");
const csvtojson = require("csvtojson");
// const { emitNotification } = require("../service/notification");
const User = require("../models/user");
const leadController = require("../controllers/leadController");
const Notification = require("../models/notification");
const notificationController = require("../controllers/notificationController");
const moment = require("moment-timezone");
const fs = require("fs");
const { Worker } = require('worker_threads');
const startTime = 8;
const endTime = 17;
const threshold = 4;
require("dotenv").config();
const mongoose = require("mongoose");


async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    scheduleNextExecution();
    console.log("Connected to MongoDB");

    
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Exit the process if there's an error
  }
}

async function assignLeadsToCounselors() {
    console.log("ok");
    try {
      // Get leads with an assigned lead status
      const leadsWithAssignedStatus = await Lead.find({
        assignment_id: { $exists: true },
        status_id: "65ada2f8da40b8a3e87bda82",
      });
  
      console.log("Leads with new status", leadsWithAssignedStatus.length);
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
          //console.log(addedTime,currentTime)
  
          //Check leads came after 17h to 8h
          if (!(addedTime >= startTime && addedTime <= endTime)) {
            if (Math.abs(currentTime - startTime) >= threshold) {
              //console.log(leadLastAssigned.assigned_at,addedTime,currentTime,currentDateTime)
              console.log("1 Value");
              return lead;
            } else {
              console.log("Null Value");
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
  
          //console.log(leadLastAssigned.assigned_at,addedTime,AddedDateCounterPart,currentTime,currentDateTime,CurrentDateCounterPart,CurrentDateCounterPart.isSame(AddedDateCounterPart))
  
          //Check leads came before 17h but not filled with 4h threshold
          if (!CurrentDateCounterPart.isSame(AddedDateCounterPart)) {
            if (Math.abs(addedTime - endTime) <= threshold) {
              if (
                Math.abs(addedTime - endTime) +
                Math.abs(currentTime - startTime) >=
                threshold
              ) {
                console.log("2 Value");
                return lead;
              } else {
                console.log("Null Value");
                return null;
              }
            }
          }
  
          //Other normal flow
          if (Math.abs(currentTime - addedTime) >= threshold) {
            console.log("3 Value");
            return lead;
          } else {
            console.log("Null Value");
            return null;
          }
        })
      );
      // Remove null values from the leadsToReassign array
      const filteredLeadsToReassign = leadsToReassign.filter(
        (lead) => lead !== null
      );
      console.log("leads to re assign", filteredLeadsToReassign.length);
      //console.log('leads to re assign', filteredLeadsToReassign)
  
      // File path
      const filePath = "filtered_leads4.txt";
  
      // Write data to the file
      fs.writeFile(filePath, JSON.stringify(filteredLeadsToReassign), (err) => {
        if (err) {
          console.error("Error writing to file:", err);
          return;
        }
        console.log("Data has been written to", filePath);
      });
  
      const filePath2 = "original_new_leads4.txt";
  
      // Write data to the file
      fs.writeFile(filePath2, JSON.stringify(leadsWithAssignedStatus), (err) => {
        if (err) {
          console.error("Error writing to file:", err);
          return;
        }
        console.log("Data has been written to", filePath);
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
  
        console.log("notification was called");
        await notificationController.sendNotificationToCounselor(
          latestAssignment.counsellor_id,
          `The lead belongs to ${leadDoc.student_id.email} has been revoked from you.`,
          "error"
        );
        console.log("notification was called after");
  
        // Get the least and next least allocated counselors
        const { leastAllocatedCounselor, nextLeastAllocatedCounselor } =
          await getLeastAndNextLeastAllocatedCounselors(
            lead.course_id.toString()
          );
  
        console.log('allocated counsellors',leastAllocatedCounselor, nextLeastAllocatedCounselor)
  
        //check if the lead allocated to same counselor
        if (
          latestAssignment.counsellor_id &&
          latestAssignment.counsellor_id.equals(leastAllocatedCounselor)
        ) {
          console.log("allocated to same counsellor assignment");
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
            console.log("counsellor assignment made - ", counsellorAssignment);
            // Update lead with assignment_id
            lead.assignment_id = counsellorAssignment._id;
            lead.counsellor_id = nextLeastAllocatedCounselor._id;
            await lead.save();
  
            console.log("lead", lead);
            console.log("notification was called");
            await notificationController.sendNotificationToCounselor(
              nextLeastAllocatedCounselor._id,
              `You have assigned a new lead belongs to ${leadDoc.student_id.email}.`,
              "success"
            );
            console.log("notification was called after");
          } catch (error) {
            console.log(error);
          }
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
            console.log("Counsellor assignment made - ", counsellorAssignment);
  
            // Update lead with assignment_id
            lead.assignment_id = counsellorAssignment._id;
            lead.counsellor_id = leastAllocatedCounselor._id;
            await lead.save();
  
            console.log("Notification was called");
  
            // Check if leadDoc.student_id is defined before accessing its properties
            if (leadDoc.student_id && leadDoc.student_id.email) {
              await notificationController.sendNotificationToCounselor(
                leastAllocatedCounselor._id,
                `You have been assigned a new lead belonging to ${leadDoc.student_id.email}.`,
                "success"
              );
            } else {
              console.error("Error: student_id or email is null or undefined.");
            }
  
            console.log("Notification was called after");
  
            console.log("Lead:", lead);
            console.log("Assignment:", counsellorAssignment);
          } catch (error) {
            console.log("Error:", error);
          }
        }
      }
      console.log("Allocation completed");
    } catch (error) {
      console.error("Error assigning leads to counselors:", error);
      throw error;
    }
  }

async function scheduleNextExecution() {
    let currentDate = new Date();
    const targetTimeZone = "Asia/Colombo"; // Replace with the desired time zone
    const currentDateTime = new Date(
      moment.tz(currentDate, targetTimeZone).format("YYYY-MM-DDTHH:mm:ss[Z]")
    );
    const currentHour = currentDateTime.getUTCHours();
    console.log(currentDateTime, currentDateTime.getUTCHours());
    await assignLeadsToCounselors();
    // Check if the current time is between 8 am and 5 pm
    if (currentHour >= startTime && currentHour <= endTime) {
      // Call the function every minute
      setInterval(() => {
        assignLeadsToCounselors();
      }, 1200000);
      //1200000
    } else {
      console.log("Scheduled time is over. Task will resume tomorrow at 8 am.");
    }
  
    // Schedule the next check after 1 hour
    setTimeout(scheduleNextExecution, 3600000); // 1 hour in milliseconds
  }

connectToDatabase();

// Schedule the next check after 1 hour
setTimeout(scheduleNextExecution, 3600000); // 1 hour in milliseconds