const mongoose = require("mongoose");

const smartAccessories_Schema = new mongoose.Schema(
  {
    smartAccessory_Name: {
      type: String,
    },
    images: {
      type: [String],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    stock: {
      type: String,
      enum: ["inStock", "outOfStock"],
      required: true,
    },
    nfcID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "nfc",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("smartAccessories", smartAccessories_Schema);
