const express = require("express");
const EmailTemplate = require("../controllers/messageTemplateController");

const router = express.Router();

router.get("/emailTemplates", EmailTemplate.getEmailTemplates);
router.post("/sendCustomSMS", EmailTemplate.sendCustomSMS);

module.exports = router;