const express = require("express");
const referralController = require("../controllers/referralController");

const router = express.Router();

router.post("/add-new-referral", referralController.addNewReferral);
router.get("/getReferrals", referralController.getAllReferral);

module.exports = router;
