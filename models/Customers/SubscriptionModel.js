const mongoose = require("mongoose");
const SubscriptionSchema = new mongoose.Schema({

    type_name : {type :String,required:[true,"Please Enter Plan type"]},
    price : {type : Number,required:[true,"Please Enter Plan Price"]},
    baseUserCount : {type:Number,required:[true,"Please Enter Base Included Users"]},
    features_list : [String]



},{timestamps:true})

module.exports = mongoose.model("subscription",SubscriptionSchema);