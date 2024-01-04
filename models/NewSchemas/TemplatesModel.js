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
        },
        Assigned_To: {
            type: String,
        },
        images: {
            type: [String],
            required: true,
        },
        testimonials: [
            {
                name: {
                    type: String,
                    required: true,
                },
                content: {
                    type: String,
                    required: true,
                }
            }
        ],
        Assigned_Group: [
            {
                type: String,
                value: { type: String },
                required: true,
            }
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('templates', TemplatesModel);
