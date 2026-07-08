const mongoose = require('mongoose');

const projectRequestSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  note: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 300
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  respondedAt: {
    type: Date
  }
}, {
  timestamps: true // createdAt and updatedAt
});

projectRequestSchema.index({ project: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('ProjectRequest', projectRequestSchema);
