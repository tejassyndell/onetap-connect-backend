const mongoose = require('mongoose');

const addOnSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isOneTime : {
    type: Boolean,
    default: true
  }
});

const AddOn = mongoose.model('addon', addOnSchema);

module.exports = AddOn;
