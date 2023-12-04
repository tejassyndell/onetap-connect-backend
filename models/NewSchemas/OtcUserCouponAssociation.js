const mongoose = require('mongoose');

const UserCouponAssociationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'user',
    },
    couponCode: {
        type: String,
        required: true,
    },
    usageCount: {
        type: Number,
        default: 1,
    },
}, { timestamps: true });

const UserCouponAssociation = mongoose.model('UserCouponAssociation', UserCouponAssociationSchema);

module.exports = UserCouponAssociation;
