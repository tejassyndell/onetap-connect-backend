const mongoose = require('mongoose');
const validator = require("validator");

require('dotenv').config();


// Role enum for validation
// const roles = ['administrator', 'manager', 'member'];

const invitedTeamMemberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    // unique: true,
    validate: [validator.isEmail, "Please enter valid Email"],
  },
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['administrator', 'manager', 'teammember'],
    default: 'teammember',
  },
  invitationToken: {
    type: String,
    required: true,
    unique: true,
  },
  invitationExpiry: {
    type: Date,
    required: true,
  },
  avatar : {type:String,default:''},
  companyId: {
    type: mongoose.Types.ObjectId,
    ref: 'company',
    required: true,
  },
  team : {
    type: mongoose.Types.ObjectId,
  },
  status:{type:String,default:'pending'}

}, { timestamps: true } );

module.exports = mongoose.model('invited_team_members', invitedTeamMemberSchema);

// module.exports = InvitedTeamMember;
