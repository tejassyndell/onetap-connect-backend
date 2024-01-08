const mongoose = require('mongoose');

const TemplatesModel = new mongoose.Schema(
    {
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "companies_information",
            default: null,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        status: {
            type: String,
            default: 'Draft',
        },
        Assigned_To: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "team",
            default: null,
        },


    },
    { timestamps: true }
);

module.exports = mongoose.model('templates', TemplatesModel);
