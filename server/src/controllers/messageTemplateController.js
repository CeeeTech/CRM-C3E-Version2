const MessageTemplate = require("../models/messageTemplate");
const axios = require("axios");
const moment = require("moment");

// get all email templates
async function getEmailTemplates(req, res) {
  try {
    const emailTemplates = await MessageTemplate.find();
    res.status(200).json(emailTemplates);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// send custom sms to a user
async function sendCustomSMS(req, res) {
  try {
    const { contact_no, message } = req.body;
    sendSMStoCustomer(contact_no, message);
    res.status(200).json({ message: "SMS sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Function to send the verification code via SMS (replace with your preferred method)
async function sendSMStoCustomer(phoneNumber, message) {
  const url = "https://richcommunication.dialog.lk/api/sms/send";
  const apiKey = process.env.SMS_API_KEY;

  // Normalize the phone number
  const newPhoneNumber = normalizePhoneNumber(phoneNumber);

  const data = {
    messages: [
      {
        clientRef: "0934345",
        number: newPhoneNumber,
        mask: "SLTC", // Update the mask if necessary
        text: message,
        campaignName: "customMessage",
      },
    ],
  };

  // Get the current date time in the required format
  const currentDateTime = moment().format("YYYY-MM-DDTHH:mm:ss");
  console.log("Current date time:", currentDateTime);

  try {
    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
        USER: "user_slt",
        DIGEST: "23383276670a8227dc53f93a952ccfa6",
        CREATED: currentDateTime,
        Authorization: `Bearer ${apiKey}`,
      },
    });

    // Log the response status
    console.log("Response status:", response.status);

    // Check if response data exists
    const responseData = response.data;
    console.log("Response data:", responseData);

    // Check if response status is OK
    if (response.status === 200) {
      console.log("Message sent successfully");
      return true;
    } else {
      console.error("SMS sending failed:", responseData);
      throw new Error(
        `SMS sending failed with status code: ${response.status}`
      );
    }
  } catch (error) {
    console.error("Error sending Message:", error.message);
    throw error;
  }
}

function normalizePhoneNumber(phoneNumber) {
  // Remove any non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, "");
  // If the number starts with '0', remove it and prepend '94', else just return the number
  return digitsOnly.startsWith("0") ? "94" + digitsOnly.slice(1) : digitsOnly;
}

module.exports = {
  getEmailTemplates,
  sendCustomSMS,
};
