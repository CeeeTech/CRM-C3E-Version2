const Referee = require("../models/referee");

async function getAllReferral(req, res) {
  try {
    const referrals = await Referee.find()
      // .populate("student_id")
      .populate("referee_id");
    res.status(200).json({ referrals });
    //console.log(referrals);
  } catch (error) {
    console.error("Error getting referrals:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
module.exports = {
  getAllReferral,
};
