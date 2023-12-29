const mongoose = require("mongoose");

const ShareCardEmail = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      // required: true,
    },
    User_name: {
      type: String,
    },
    recipient_email: {
      type: String,
    },
    Text_message: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Share_Mycard_Email", ShareCardEmail);
