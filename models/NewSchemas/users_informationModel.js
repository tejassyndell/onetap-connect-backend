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
        website_url: {
            type: String,
            // required: [true, "Please Enter The Company URL"],
        },
        global_email: {
            type: String,
            // required: [true, "Please Enter The Company email"],
        },
        primary_office_num: {
            type: Number,
            // required: [true, "Please Enter The Company Number"],
        },
        fax_number: {
            type: Number,
            // required: [true, "Please Enter The Company fax Number"],
        },
        address: {
            line1: { type: String, default: null },
            line2: { type: String, default: null },
            city: { type: String, default: null },
            state: { type: String, default: null },
            country: { type: String, default: null },
            postal_code: { type: String, default: null },
        },
        aboutUser: {
            type: String,
            default: null
        },
        useraboutvideo: {
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
        keywords: [{ type: String }],
        social_media: [
            {
              name: { type: String, default: null },
              link: { type: String, default: null },
            },
          ],
        other_links: [
            {
              name: { type: String, default: null },
              link: { type: String, default: null },
            },
          ],
        custom_fields: [
            {
                name: { type: String, default: null },
                value: { type: String, default: null },
                
            },
        ],
        shipping_method: [{
            type: { type: String },
            price: { type: Number }
          }],
        subscription_details: {
            // subscription: {
            //   type: mongoose.Schema.Types.ObjectId,
            //   ref: "Subscription",
            // },
            subscription_id : {type : String, default : null},
            addones: [{type: mongoose.Schema.Types.ObjectId}],
            userCount: { type : Number},
            total_amount: { type: Number },
            // payment_status: { type: String },
            billing_cycle: { type: String },
            plan: { type: String },
            total_user: [
                {
                  baseUser: { type: Number },
                  additionalUser: { type: Number }
                }
              ],
            recurring_amount: { type: Number },
            renewal_date: { type: Date },
            auto_renewal: { type: Boolean, default: true },
          },
        // addones: [{ service: { type: String }, price: { type: Number } }],
    },
    { timestamps: true }
);

module.exports = mongoose.model('users_information', users_information);
