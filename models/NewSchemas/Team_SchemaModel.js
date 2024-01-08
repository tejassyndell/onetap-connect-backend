const mongoose = require("mongoose");
const Team_Schema = new mongoose.Schema(
    {   
        team_name: { type: String},
        companyID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'company',
        },
    },
    { timestamps: true }
);
module.exports = mongoose.model("team", Team_Schema);
