const mongoose = require('mongoose');

const Company_Share_ReferralSchema = new mongoose.Schema(

    {
        share_by_text: {
            type: String,
            default: null
        },
        share_by_email: {
            type: String,
            default: null
        },
        share_by_socialmedia: {
            type: String,
            default: null
        },
        reffer_name: {
            type: String,
            default: null
        },
        companyID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'company',
            required: true,
        },
        connect_button_behaviour: {
            type: Boolean,
            default: false,
        },
        default_crm_link: {
            value: {
                type: String,
                default: null
            }, permission: {
                type: Boolean,
                default: false,
            }
        },

        default_connect_msg: {
            value: {
                type: String,
                default: null
            }, permission: {
                type: Boolean,
                default: false,
            },
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model("companies_share_referral_data", Company_Share_ReferralSchema);