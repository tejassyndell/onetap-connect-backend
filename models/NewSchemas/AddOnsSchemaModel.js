const mongoose = require("mongoose");

const AddOns_Schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please Enter Your Name"],
        },
        description: {
            type: String,
            required: true,
        },
        price:{
            type:number,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AddOns_Schema", AddOns_Schema);