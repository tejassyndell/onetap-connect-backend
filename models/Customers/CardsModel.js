const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const cardsSchema = new mongoose.Schema({
  nameOnCard: {
    type: String,
    required: true,
  },
  cardNumber: {
    type: String,
    required: true,
    unique: true,
    // Validate card number using regex (this is a basic example)
    match: /^[0-9]{16}$/, // Assuming a 16-digit card number format
  },
  expirationDate: {
    type: Date,
  },
  CVV: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['expired', 'active'],
    default: 'active',
  },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
}, { timestamps: true });

// Mongoose pre-save middleware to hash the security code before saving
cardsSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('CVV')) {
      return next();
    }
    const hashedCVV = await bcrypt.hash(this.CVV, 10);
    this.CVV = hashedCVV;
    next();
  } catch (err) {
    return next(err);
  }
});

// Method to compare security code during verification
cardsSchema.methods.compareCVV = async function (CVV) {
  try {
    return await bcrypt.compare(CVV, this.CVV);
  } catch (err) {
    throw err;
  }
};

module.exports = mongoose.model("card", cardsSchema);

