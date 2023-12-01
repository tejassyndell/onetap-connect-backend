const mongoose = require('mongoose');

const Notification_schema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        title: { type: String },
        body: { type: String }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Notification', Notification_schema);
