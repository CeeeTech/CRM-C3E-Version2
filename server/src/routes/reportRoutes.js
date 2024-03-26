const express = require("express");
const reportController = require("../controllers/reportController");

const router = express.Router();

router.get("/reports", reportController.getAllReports);
router.get("/repleads", reportController.fetchLeads);
router.get("/moduleinteraction", reportController.fetchInteraction);

router.get("/sourcecount", reportController.sourceCount);
router.get(
  "/moduleinteractionbycounsellor/:counsellor_id",
  reportController.fetchInteractionByCounsellor
);
router.get("/funcnames", reportController.countFunctionNames);
router.get(
  "/funcnamesbycounsellor/:counsellor_id",
  reportController.countFunctionNamesbyCounsellor
);

module.exports = router;
