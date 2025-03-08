
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  ipfsHash: {
    type: String,
    required: true,
  },
  encryptionKey: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  transactionHash: {
    type: String,
    required: true,
  },
  accessList: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    expiresAt: {
      type: Date,
    },
    grantedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  fileType: {
    type: String,
    trim: true,
  },
  fileSize: {
    type: Number,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
