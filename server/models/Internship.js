const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    trim: true
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  paidOrUnpaid: {
    type: String,
    enum: ['Paid', 'Unpaid'],
    required: [true, 'Please specify if paid or unpaid']
  },
  selectionProcess: {
    type: String,
    required: [true, 'Selection process description is required'],
    maxlength: [3000, 'Selection process cannot exceed 3000 characters']
  },
  interviewQuestions: [{
    type: String,
    trim: true
  }],
  skillsRequired: [{
    type: String,
    trim: true
  }],
  preparationTips: {
    type: String,
    maxlength: [3000, 'Preparation tips cannot exceed 3000 characters'],
    default: ''
  },
  experience: {
    type: String,
    required: [true, 'Experience description is required'],
    maxlength: [5000, 'Experience cannot exceed 5000 characters']
  },
  certificate: {
    type: String,
    default: ''
  },
  offerLetter: {
    type: String,
    default: ''
  },
  linkedin: {
    type: String,
    default: ''
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

internshipSchema.index({ company: 'text', role: 'text', skillsRequired: 'text', experience: 'text' });
internshipSchema.index({ company: 1 });
internshipSchema.index({ postedBy: 1 });
internshipSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Internship', internshipSchema);
