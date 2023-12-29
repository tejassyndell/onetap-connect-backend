const mongoose = require("mongoose");

const redirect_link_schema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      // required: true,
    },
    companyID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies_information",
    },
    user_slugs: [
      {
        value: { type: String, unique: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    userurlslug: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("redirect_link", redirect_link_schema);
