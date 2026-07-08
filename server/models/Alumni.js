const mongoose = require('mongoose');

const alumniSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  batch: {
    type: String,
    required: [true, 'Batch year is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company is required'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Position/role is required'],
    trim: true
  },
  linkedin: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  experience: {
    type: String,
    maxlength: [5000, 'Experience cannot exceed 5000 characters'],
    default: ''
  },
  adviceForJuniors: {
    type: String,
    maxlength: [3000, 'Advice cannot exceed 3000 characters'],
    default: ''
  },
  interviewTips: {
    type: String,
    maxlength: [3000, 'Interview tips cannot exceed 3000 characters'],
    default: ''
  },
  careerRoadmap: {
    type: String,
    maxlength: [3000, 'Career roadmap cannot exceed 3000 characters'],
    default: ''
  },
  achievements: [{
    type: String,
    trim: true
  }],
  photo: {
    type: String,
    default: ''
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

alumniSchema.index({ name: 'text', company: 'text', role: 'text', experience: 'text' });
alumniSchema.index({ batch: 1, company: 1 });
alumniSchema.index({ userId: 1 });
alumniSchema.index({ approved: 1 });

module.exports = mongoose.model('Alumni', alumniSchema);
