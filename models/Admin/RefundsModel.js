const mongoose = require('mongoose');
const refundsSchema = new mongoose.Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  order_id: {
    type: Schema.Types.ObjectId,
    ref: 'order',
    required: true,
  },
  refund_amount: {
    type: Number,
    required: true,
    min: 0,
  },
  refund_reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['requested', 'approved', 'rejected', 'processed'],
    default: 'requested',
  },
  request_date: {
    type: Date,
    required: true,
  },
  approval_date: {
    type: Date,
  },
  processed_date: {
    type: Date,
  },
  admin_notes: {
    type: String,
  },
  payment_method: {
    type: String,
    required: true,
  },
  payment_details: {
    transaction_id: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
    },
  },
});
module.exports = mongoose.model('refund', refundsSchema);
