const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Please Enter Plan type"],
        enum: ['free', 'starter', 'team', 'enterprise'],
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        // required: true,
        enum: ['monthly', 'yearly'],
    },
    baseUserCount: {
        type: Number,
        default: 1,
        min: 1,
        // required:[true,"Please Enter Base Included Users"]
    },
    price: {
        type: Number,
        required: [true, "Please Enter Plan Price"],
        min: 0,
    },
    features: {
        type: [String],
        required: true,
    },

}, { timestamps: true });


module.exports = mongoose.model("subscription", SubscriptionSchema);