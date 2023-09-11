const mongoose = require("mongoose");

const PlanPackageSchema = new mongoose.Schema({

    planName: {
        type: String,
        required: [true, "Please Enter Plan type"],
        
    },
    description: {
        type: String,
        required: true,
    },
    paymentDetails : {type:String},
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
    discoutedPercentage:{
        type: Number,
    },
    features: [{type:String}],
    isActive : {type:Boolean,default:false}

}, { timestamps: true });


module.exports = mongoose.model("plan_packages", PlanPackageSchema);