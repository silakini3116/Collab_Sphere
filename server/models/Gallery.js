const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  year: {
    type: Number,
    required: [true, 'Year is required']
  },
  album: {
    type: String,
    required: [true, 'Album name is required'],
    enum: [
      'Technical Symposium', 'Sports', 'Industrial Visit', 'Workshops',
      'Graduation Day', 'Placement Celebration', 'Freshers', 'Farewell',
      'Club Activities', 'Other'
    ]
  },
  images: [{
    url: { type: String, required: true },
    publicId: { type: String },
    caption: { type: String, default: '' }
  }],
  caption: {
    type: String,
    default: '',
    maxlength: [500, 'Caption cannot exceed 500 characters']
  },
  uploadedBy: {
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

gallerySchema.index({ year: 1, album: 1 });
gallerySchema.index({ uploadedBy: 1 });
gallerySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Gallery', gallerySchema);
