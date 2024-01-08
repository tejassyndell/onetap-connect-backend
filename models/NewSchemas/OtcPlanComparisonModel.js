const mongoose = require('mongoose');
const planComparisonSchema = new mongoose.Schema({
    fieldName: String,
    features: [{
        featureName: String,
        free: { value: String, comment: String },
        professional: { value: String, comment: String },
        team: { value: String, comment: String },
    }],
    status: {
        type: String,
        default: 'Published', // Set your default status value here
    },
    visibility: {
        type: String,
        default: 'Public',
    },
    publishedBy: String,
},
    { timestamps: true }
);
module.exports = mongoose.model('otc_planComparisions', planComparisonSchema);
