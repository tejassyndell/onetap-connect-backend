const mongoose = require("mongoose");

const Otc_Adminteams = new mongoose.Schema(
    {
        team_name: { type: String},
        // companyID: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'company',
        //     // required: true,
        // },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Otc_Adminteams", Otc_Adminteams);
