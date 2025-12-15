const mongoose = require("mongoose")
const {model,Schema} = mongoose

const query = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: Number, required: false },
  query: { type: String, required: true },
});

module.exports = model("query", query)