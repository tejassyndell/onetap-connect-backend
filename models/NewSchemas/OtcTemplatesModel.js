const mongoose = require('mongoose');

const OtcTemplatesModel = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true
        },
        status: {
            type: String,
            default: 'Draft',
        },
        image: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String,
        },
        // testimonials: [
        //     {
        //         name: {
        //             type: String,
        //             required: true,
        //         },
        //         content: {
        //             type: String,
        //             required: true,
        //         }
        //     }
        // ],
        // Assigned_Group: [
        //     {
        //         type: String,
        //         value: { type: String },
        //         required: true,
        //     }
        // ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('otc_templates', OtcTemplatesModel);
