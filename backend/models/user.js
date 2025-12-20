const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const regUser = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: {type:Number, required:false},
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

module.exports = model("user", regUser);
