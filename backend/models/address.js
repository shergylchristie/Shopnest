// models/Address.js
const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const addressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

  name: { type: String, required: true },
  phone: { type: String, required: true },

  label: { type: String, required: false },
  addressline: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },

  default: { type: Boolean, default: false },

});

module.exports = model("Address", addressSchema);
