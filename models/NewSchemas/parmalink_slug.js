const mongoose = require("mongoose");

const parmalink_slug_Schema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            // required: true,
        },
        companyID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "company",
        },
        unique_slugs: [
            {
                value: { type: String },
                timestamp: { type: Date, default: Date.now },
            }
        ],
        companyunique_slug: [
            {
                value: { type: String },
                timestamp: { type: Date, default: Date.now },
            }
        ],
        userurlslug: {
            type: String,
            ref: 'user',
        },
        companyurlslug: {
            type: String,
            ref: 'company',
        },
        isactive:{
            type: Boolean,
            default: true,
        },
        redirectUserId : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            default: null,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("parmalink_slug", parmalink_slug_Schema);