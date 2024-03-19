const Product = require("../models/product");
const mongoose = require("mongoose");

async function getProducts(req, res) {
  try {
    const products = await Product.find().populate("product_type");
    console.log(products);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getProduct(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "No such product" });
  }
  const product = await Product.findById({ _id: id });
  if (!product) {
    res.status(400).json({ error: "No such product" });
  }
  res.status(200).json(product);
}

//add new product
async function addProduct(req, res) {
  const { groupname, product_type } = req.body;
  if (!groupname) {
    res.status(400).json({ error: "Name is required" });
  }
  const product = new Product({ groupname, product_type });
  try {
    const newproduct = await product.save();
    res.status(201).json(newproduct);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// update course - name, description(not required)
async function updateProduct(req, res) {
  const { id } = req.params;
  const { groupname, product_type } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "No such product" });
  }
  const product = await Product.findByIdAndUpdate(
    id,
    { groupname, product_type },
    { new: true }
  );
  if (!product) {
    res.status(400).json({ error: "No such product" });
  }
  res.status(200).json(product);
}

module.exports = {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
};
