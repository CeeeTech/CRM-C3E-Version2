const mongoose = require("mongoose");

const refereeSchema = new mongoose.Schema({
  full_name: String,
  contact_number: String,

  referee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Referee' }
},{
  timestamps: true
});

const Referee = mongoose.model("Referee", refereeSchema);

module.exports = Referee;