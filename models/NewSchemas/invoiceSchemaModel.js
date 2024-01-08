const mongoose = require('mongoose');
const invoice_Schema = new mongoose.Schema(
    {
        invoiceNumber: { type: Number },
        order_id: {
            type: Schema.Types.ObjectId,
            ref: 'order',
            required: true,
        },
    },
    { timestamps: true }
);
module.exports = mongoose.model('invoice ', invoice_Schema);
