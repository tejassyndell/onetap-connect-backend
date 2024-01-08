const mongoose = require("mongoose");
const subscription_plan_schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please Enter Your Name"],
        },
        description: {
            type: String,
            required: true,
        },
        type:{
            enum: ['expired', 'active'],
            default: 'active',
        },
        included_users:{
            type:number,
            required: true,
        },
        base_price:{
            type:number,
            required: true,
        },
        features:[{}],
    },
    { timestamps: true }
);
module.exports = mongoose.model("subscription_plan_schema", subscription_plan_schema);