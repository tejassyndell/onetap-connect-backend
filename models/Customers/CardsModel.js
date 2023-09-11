const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const cardsSchema = new mongoose.Schema({
  nameOnCard: {
    type: String,
  },
  cardNumber: {
    type: Number,
    required: true,
  },
  cardExpiryMonth: {
    type: Number,
  },
  cardExpiryYear: {
    type: Number,
  },
  CVV: {
    type: String,
  },
  brand:{
    type: String,
  },
  status: {
    type: String,
    enum: ['expired', 'active','primary'],
    default: 'active',
  },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
}, { timestamps: true });

// Mongoose pre-save middleware to hash the security code before saving
// cardsSchema.pre('save', async function (next) {
//   try {
//     if (!this.isModified('CVV')) {
//       return next();
//     }
//     const hashedCVV = await bcrypt.hash(this.CVV, 10);
//     this.CVV = hashedCVV;
//     next();
//   } catch (err) {
//     return next(err);
//   }
// });

// // Method to compare security code during verification
// cardsSchema.methods.compareCVV = async function (CVV) {
//   try {
//     return await bcrypt.compare(CVV, this.CVV);
//   } catch (err) {
//     throw err;
//   }
// };

module.exports = mongoose.model("payment_cards", cardsSchema);

