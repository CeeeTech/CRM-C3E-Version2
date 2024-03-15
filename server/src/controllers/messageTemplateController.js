const MessageTemplate = require("../models/messageTemplate");

// get all email templates
async function getEmailTemplates(req, res) {
  try {
    const emailTemplates = await MessageTemplate.find();
    res.status(200).json(emailTemplates);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getEmailTemplates,
};
