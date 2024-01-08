const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  stock: {
    type: String,
    enum: ['inStock', 'outOfStock'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
}, { timestamps: true } );
module.exports = mongoose.model('Product', productSchema);
