const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  tokenKey: {
    type: String,
    required: true
  },
  isBlocked: {
    type: Boolean,
    required: true,
    default: false
  },
}, {
  timestamps: true,
});

tokenSchema.index(
  { tokenKey: 1 }
);

tokenSchema.index({
  updatedAt: 1
});

tokenSchema.index({
  isBlocked: 1
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
