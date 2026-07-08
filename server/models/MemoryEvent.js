const mongoose = require('mongoose');

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const memoryEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    default: '',
    maxlength: [3000, 'Description cannot exceed 3000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  venue: { type: String, default: '', trim: true },
  academicYear: {
    type: Number,
    required: [true, 'Academic year is required'],
    min: [2020, 'Year must be 2020 or later'],
    max: [2030, 'Year must be 2030 or earlier']
  },
  month: {
    type: Number,
    required: [true, 'Month is required'],
    min: [1, 'Month must be between 1 and 12'],
    max: [12, 'Month must be between 1 and 12']
  },
  coverImage: { type: String, default: '' },
  coverImagePublicId: { type: String, default: '' },
  facultyCoordinator: { type: String, default: '', trim: true },
  tags: [{ type: String, trim: true, lowercase: true }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isApproved: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

memoryEventSchema.virtual('monthName').get(function () {
  return MONTH_NAMES[this.month - 1];
});

memoryEventSchema.index({ academicYear: 1, month: 1 });
memoryEventSchema.index({ createdBy: 1 });
memoryEventSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('MemoryEvent', memoryEventSchema);
