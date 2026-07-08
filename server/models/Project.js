const mongoose = require('mongoose');

const PROJECT_EXPIRY_DAYS = 60;

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 120
  },
  overview: {
    type: String,
    required: true,
    maxlength: 1000
  },
  techStack: [{ type: String }],
  rolesNeeded: [{
    role: { type: String },
    skills: [{ type: String }]
  }],
  commitment: { type: String },
  benefits: { type: mongoose.Schema.Types.Mixed }, // String or Array of Strings
  contact: {
    email: { type: String },
    phone: { type: String }
  },
  category: {
    type: String,
    enum: ['AI', 'ML', 'IoT', 'Embedded', 'Robotics', 'Web', 'Mobile App', 'Other']
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + PROJECT_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

projectSchema.pre('validate', function(next) {
  if (!this.contact || (!this.contact.email && !this.contact.phone)) {
    this.invalidate('contact', 'At least one contact method is required');
  }
  next();
});

projectSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
projectSchema.index({ title: 'text', techStack: 'text', 'rolesNeeded.skills': 'text' });

module.exports = mongoose.model('Project', projectSchema);
