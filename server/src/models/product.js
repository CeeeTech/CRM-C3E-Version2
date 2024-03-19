const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  groupname: String,
  product_type: String,
  status: {
    type: Boolean,
    default: true,
  },
});

const product = mongoose.model("Product", productSchema);

module.exports = product;
