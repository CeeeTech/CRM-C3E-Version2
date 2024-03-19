const express = require("express");
const productController = require("../controllers/productController");

const router = express.Router();

router.get("/products", productController.getProducts);
router.get("/product/:id", productController.getProduct);
router.post("/product-form-add-new", productController.addProduct);
router.put("/product-form-update/:id", productController.updateProduct);

module.exports = router;
