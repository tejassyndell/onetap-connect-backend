const mongoose = require('mongoose');
const supportTicketSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'received', 'active'],
    default: 'pending',
  },
  priority: {
    type: String,
    required: true,
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'oneTapConnectMembers',
  },
}, { timestamps: true });
module.exports = mongoose.model('supportTicket', supportTicketSchema);
