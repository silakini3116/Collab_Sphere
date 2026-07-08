const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');
const { authorize, requireVerified } = require('../middleware/rbac');
const { uploadEvent, localPathMiddleware } = require('../config/cloudinary');

const router = express.Router();

// Create event
router.post('/', auth, requireVerified, uploadEvent.single('image'), localPathMiddleware('events'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('date').notEmpty().withMessage('Date is required'),
  body('venue').trim().notEmpty().withMessage('Venue is required'),
  body('organizer').trim().notEmpty().withMessage('Organizer is required'),
  body('category').isIn(['Workshop', 'Hackathon', 'Symposium', 'Placement', 'Seminar', 'Sports', 'Cultural', 'Other']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg, details: errors.array() });
    }

    // time field: frontend may send an end-date string or an actual time string
    const rawTime = req.body.time || req.body.endDate || '';
    const timeValue = rawTime && /^\d{4}-\d{2}-\d{2}$/.test(rawTime)
      ? `Ends ${rawTime}`   // convert ISO date → readable label
      : (rawTime || 'TBA');

    const eventData = {
      title: req.body.title,
      description: req.body.description || 'No description provided.',
      date: req.body.date,
      time: timeValue,
      venue: req.body.venue || 'TBA',
      organizer: req.body.organizer,
      registrationLink: req.body.registrationLink || '',
      category: req.body.category,
      postedBy: req.user._id,
      isOfficial: req.user.role === 'teacher',
      image: req.file ? req.file.path : (req.body.image || '')
    };

    const event = new Event(eventData);
    await event.save();

    // Notify all users about new event
    const users = await User.find({ _id: { $ne: req.user._id } }).select('_id');
    const notifications = users.map(u => ({
      userId: u._id,
      type: 'event',
      message: `New event: "${event.title}" posted by ${req.user.name}`,
      relatedId: event._id,
      relatedModel: 'Event'
    }));
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    await event.populate('postedBy', 'name role year profilePhoto registerNumber designation department');
    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Event creation error:', error);
    res.status(500).json({ error: 'Server error creating event' });
  }
});

// Get all events with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search, upcoming, page = 1, limit = 12 } = req.query;
    const filter = {};

    if (category && category !== 'all') filter.category = category;
    if (upcoming === 'true') filter.date = { $gte: new Date() };
    if (search) {
      filter.$text = { $search: search };
    }

    const events = await Event.find(filter)
      .populate('postedBy', 'name role year profilePhoto registerNumber designation department')
      .populate('comments.user', 'name profilePhoto')
      .sort({ date: upcoming === 'true' ? 1 : -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(filter);

    res.json({ events, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Server error fetching events' });
  }
});

// Get single event
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('postedBy', 'name role year profilePhoto registerNumber designation department')
      .populate('comments.user', 'name profilePhoto');
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update event (owner or admin)
router.put('/:id', auth, uploadEvent.single('image'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }

    const updates = {};
    const allowedFields = ['title', 'description', 'date', 'time', 'venue', 'organizer', 'registrationLink', 'category'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (req.file) updates.image = req.file.path;

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('postedBy', 'name role year profilePhoto registerNumber designation department');

    res.json({ message: 'Event updated', event: updatedEvent });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating event' });
  }
});

// Delete event (owner or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting event' });
  }
});

// Save/unsave event
router.post('/:id/save', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const index = event.savedBy.indexOf(req.user._id);
    if (index > -1) {
      event.savedBy.splice(index, 1);
      await event.save();
      res.json({ message: 'Event unsaved', saved: false });
    } else {
      event.savedBy.push(req.user._id);
      await event.save();
      res.json({ message: 'Event saved', saved: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Like/unlike event
router.post('/:id/like', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const index = event.likes.indexOf(req.user._id);
    if (index > -1) {
      event.likes.splice(index, 1);
      await event.save();
      res.json({ message: 'Event unliked', liked: false, likesCount: event.likes.length });
    } else {
      event.likes.push(req.user._id);
      await event.save();
      res.json({ message: 'Event liked', liked: true, likesCount: event.likes.length });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add comment
router.post('/:id/comment', auth, [
  body('text').trim().notEmpty().withMessage('Comment text is required')
], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    event.comments.push({ user: req.user._id, text: req.body.text });
    await event.save();

    await event.populate('comments.user', 'name profilePhoto');
    res.json({ message: 'Comment added', comments: event.comments });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
