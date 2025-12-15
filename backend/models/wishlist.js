const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const wishlistSchema = new Schema({
  userid: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true,
  },
  wishlistItems: [
    {
      productId: {  type: Schema.Types.ObjectId,  ref: "product",  required: true,
      },
    },
  ],
});

module.exports = model("Wishlist", wishlistSchema);
