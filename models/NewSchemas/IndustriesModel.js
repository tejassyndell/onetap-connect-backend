const mongoose = require("mongoose");

const industriesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("company_industry_list", industriesSchema);
