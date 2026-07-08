const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  // TTL target: auto-deleted by MongoDB the day after the event date
  autoDeleteAt: {
    type: Date
  },
  time: {
    type: String,
    required: [true, 'Event time is required']
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true
  },
  organizer: {
    type: String,
    required: [true, 'Organizer is required'],
    trim: true
  },
  registrationLink: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['Workshop', 'Hackathon', 'Symposium', 'Placement', 'Seminar', 'Sports', 'Cultural', 'Other'],
    required: [true, 'Event category is required']
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isOfficial: {
    type: Boolean,
    default: false
  },
  approved: {
    type: Boolean,
    default: true
  },
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
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

// Automatically set autoDeleteAt to end of event day (midnight the next day)
// whenever the event date is set or changed
eventSchema.pre('save', function (next) {
  if (this.isModified('date') || this.isNew) {
    const endOfEventDay = new Date(this.date);
    endOfEventDay.setHours(23, 59, 59, 999);
    this.autoDeleteAt = endOfEventDay;
  }
  next();
});

// TTL index: MongoDB will remove the document once autoDeleteAt is reached
eventSchema.index({ autoDeleteAt: 1 }, { expireAfterSeconds: 0 });

eventSchema.index({ title: 'text', description: 'text', organizer: 'text' });
eventSchema.index({ category: 1, date: -1 });
eventSchema.index({ postedBy: 1 });
eventSchema.index({ date: 1 });

module.exports = mongoose.model('Event', eventSchema);
