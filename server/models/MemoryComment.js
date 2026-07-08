const mongoose = require('mongoose');

const memoryCommentSchema = new mongoose.Schema({
  photoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MemoryPhoto',
    required: [true, 'Photo ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MemoryComment',
    default: null
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPinned: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
  mentions: [{ type: String }],
}, { timestamps: true });

memoryCommentSchema.index({ photoId: 1, createdAt: 1 });
memoryCommentSchema.index({ parentCommentId: 1 });

module.exports = mongoose.model('MemoryComment', memoryCommentSchema);
