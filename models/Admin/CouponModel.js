const mongoose = require('mongoose');


const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    required: true,
  },
  discountAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  validFrom: {
    type: Date,
    required: true,
  },
  validTo: {
    type: Date,
    required: true,
  },
  assignedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'user',
  }],
  assignedTo:{
    type:String,
  },
 
}, { timestamps: true } );

module.exports = mongoose.model('coupon', couponSchema);

