const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const order = new Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: String,
  paymentId: String,
  signature: String,
  receipt: { type: String, required: true },
  amount: Number,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = model("order", order);