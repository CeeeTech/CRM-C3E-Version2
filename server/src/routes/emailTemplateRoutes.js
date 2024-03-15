const express = require("express");
const EmailTemplate = require("../controllers/emailTemplateController");

const router = express.Router();

router.get("/emailTemplates", EmailTemplate.getEmailTemplates);

module.exports = router;