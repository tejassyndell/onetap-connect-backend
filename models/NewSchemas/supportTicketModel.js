const mongoose = require('mongoose');
const support_Ticket = new mongoose.Schema(
    {
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        subject: {
            type: String,
            required: true,
          },
          description: {
            type: String,
            required: true
        },
        status: { type: String, default: "active" },
        priority: {
            type: String,
            required: true,
          },
    },
    { timestamps: true }
);
module.exports = mongoose.model('support_Ticket ', support_Ticket);
