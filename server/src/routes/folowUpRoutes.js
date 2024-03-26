const express = require("express");
const followUpController = require("../controllers/followUpController");

const router = express.Router();

router.get("/followUps", followUpController.getFollowUps);
router.post("/followUps", followUpController.addFollowUp);
router.patch("/followUps/:id", followUpController.updateFollowUp);
router.get("/followUps/:id", followUpController.getFollowUp);
router.get(
  "/followups/by-lead/:lead_id",
  followUpController.getFollowUpsByLead
);
router.get("/followupsdate", followUpController.getFollowUpDate);
router.get("/followupsdate/:user_id", followUpController.getFollowUpDateByUser);
router.get("/statusCount", followUpController.getCounselorFollowUpStatusCount);
router.get("/allfollowupcount", followUpController.allfollowUpCountWeekly);
router.get(
  "/followupcount/:reference_number",
  followUpController.followUpCountWeekly
);
router.get(
  "/releadsbyweek/:counsellor_id",
  followUpController.findRegisteredLeadsByWeek
);
router.get(
  "/allreleadsbyweek",
  followUpController.allfindRegisteredLeadsByWeek
);
router.get("/regSourceCount", followUpController.regSourceCount);
router.get("/pendSourceCount", followUpController.pendSourceCount);

module.exports = router;
