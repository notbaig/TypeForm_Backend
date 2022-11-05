const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  token: {
    type: String
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'USER',
  },
  isIndividualAccount: {
    type: Boolean,
    default: true
  },
  isCompanyAccount: {
    type: Boolean,
    default: false
  },
  paymentVerified: {
    type: Boolean,
    default: false
  },
  submittedFormsIDs: {
    type: Array,
    default: []
  },
  createdFormsIDs: {
    type: Array,
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model("user", userSchema);