const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const product = new Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  stock: { type: String, default: "Out-Of-Stock" },
  image: { type: String, required: true },
  images: [{ type: String }],
});

module.exports = model("product", product);
