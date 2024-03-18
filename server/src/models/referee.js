const mongoose = require("mongoose");

const refereeSchema = new mongoose.Schema({
  full_name: String,
  password: String,
  email: String,
  contact_number: String,
  account_name: String,
  account_number: String,
  bank_name: String,
  branch: String,
  NIC: String,
  profilePicture: Buffer,
  status: { type: Boolean, default: true },
});

const Referee = mongoose.model("Referee", refereeSchema);

module.exports = Referee;
