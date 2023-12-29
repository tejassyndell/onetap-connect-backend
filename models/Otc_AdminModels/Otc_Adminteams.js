const mongoose = require("mongoose");

const Otc_Adminteams = new mongoose.Schema(
  {
    team_name: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Otc_Adminteams", Otc_Adminteams);
