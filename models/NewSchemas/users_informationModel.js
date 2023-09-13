const mongoose = require('mongoose');

const users_information = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            // required: true,
        },
        team: { type: mongoose.Schema.Types.ObjectId },
        company_name: {
            type: String,
            // required: [true, "Please Enter Your Company Name"],
        },
        company_name_permission: {
            type: Boolean,
            default: true,
        },
        website_url: {
            type: String,
            // required: [true, "Please Enter The Company URL"],
        },
        website_url_permission: {
            type: Boolean,
            default: false,
        },
        global_email: {
            type: String,
            // required: [true, "Please Enter The Company email"],
        },
        global_email_permission: {
            type: Boolean,
            default: false,
        },
        primary_office_num: {
            type: Number,
            // required: [true, "Please Enter The Company Number"],
        },
        primary_office_num_permission: {
            type: Boolean,
            default: false,
        },
        fax_number: {
            type: Number,
            // required: [true, "Please Enter The Company fax Number"],
        },
        fax_number_permission: {
            type: Boolean,
            default: false,
        },
        address: {
            line1: { type: String, default: null },
            line2: { type: String, default: null },
            city: { type: String, default: null },
            state: { type: String, default: null },
            country: { type: String, default: null },
            postal_code: { type: String, default: null },
        },
        address_permission: {
            type: Boolean,
            default: false,
        },
        about: {
            type: String,
            default: null
        },
        videoAboutUrl: {
            type: String,
            default: null
        },
        business_email: {
            type: String,
            // required: [true, "Please Enter The Company business email"],
        },
        booking_links: {
            type: String,
            default: null
        },
        other_links: [
            {
                title: { type: String, default: null },
                value: { type: String, default: null },
                permission: { type: Boolean, default: false },
            },
        ],
        socialLinks: [
            {
                title: { type: String, default: null },
                value: { type: String, default: null },
                permission: { type: Boolean, default: false },
            },
        ],
        subscription_details: {
            // subscription: {
            //   type: mongoose.Schema.Types.ObjectId,
            //   ref: "Subscription",
            // },
            addones: [{ service: { type: String }, price: { type: Number } }],
            userCount: { type : String},
            total_amount: { type: Number },
            // payment_status: { type: String },
            billing_cycle: { type: String },
            plan: { type: String },
            total_user: { type: Number },
            recurring_amount: { type: Number },
            renewal_date: { type: Date },
            auto_renewal: { type: Boolean, default: true },
          },
        // addones: [{ service: { type: String }, price: { type: Number } }],
    },
    { timestamps: true }
);

module.exports = mongoose.model('users_information', users_information);
