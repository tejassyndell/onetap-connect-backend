const mongoose = require('mongoose');


const billingAddressSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    companyId: {
        type: mongoose.Types.ObjectId,
        ref: 'company',
        required: true,
      },
      billing_address: {
        line1: { type: String, default: null },
        line2: { type: String, default: null },
        city: { type: String, default: null },
        state: { type: String, default: null },
        country: { type: String, default: null },
        postal_code: { type: String, default: null },
      },
})

module.exports = mongoose.model('billingAddress', billingAddressSchema)