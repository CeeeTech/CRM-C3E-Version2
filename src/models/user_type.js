const mongoose = require("mongoose");

const user_typeSchema = new mongoose.Schema({
  name: String,
  lead: String,
  user: String,
  student: String,
  branch: String,
  course: String
});

const User_type = mongoose.model("User_type", user_typeSchema);

module.exports = User_type;
