const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  password: String,
  email: String,
  product_type: String,
  user_type: { type: mongoose.Schema.Types.ObjectId, ref: "User_type" },
  profilePicture: Buffer,
  status: { type: Boolean, default: true },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
