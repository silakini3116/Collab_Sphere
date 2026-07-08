const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: {
    type: String,
    enum: ['inappropriate', 'spam', 'copyright', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'dismissed'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const memoryPhotoSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MemoryEvent',
    required: [true, 'Event ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  imageUrl: { type: String, required: [true, 'Image URL is required'] },
  publicId: { type: String, default: '' },
  caption: { type: String, default: '', maxlength: 500 },
  description: { type: String, default: '', maxlength: 2000 },
  tags: [{ type: String, trim: true, lowercase: true }],
  location: { type: String, default: '', trim: true },
  visibility: {
    type: String,
    enum: ['public', 'department', 'private'],
    default: 'public'
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downloadCount: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  reports: [reportSchema],
}, { timestamps: true });

memoryPhotoSchema.index({ eventId: 1, createdAt: -1 });
memoryPhotoSchema.index({ userId: 1 });
memoryPhotoSchema.index({ caption: 'text', tags: 'text' });

module.exports = mongoose.model('MemoryPhoto', memoryPhotoSchema);
