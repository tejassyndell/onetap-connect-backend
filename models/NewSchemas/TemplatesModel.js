const mongoose = require("mongoose");

const Templates_schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    Assigned_To: {
      type: String,
    },
    images: {
      type: [String],
      required: true,
    },
    testimonials: [
      {
        name: {
          type: String,
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
      },
    ],
    Assigned_Group: [
      {
        type: String,
        value: { type: String },
        required: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Templates ", Templates_schema);
