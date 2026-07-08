const express = require('express');
const { body, validationResult } = require('express-validator');
const Alumni = require('../models/Alumni');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { uploadProfile, localPathMiddleware } = require('../config/cloudinary');

const router = express.Router();

// Create alumni profile
router.post('/', auth, authorize('alumni', 'admin'), uploadProfile.single('photo'), localPathMiddleware('profiles'), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('batch').trim().notEmpty().withMessage('Batch is required'),
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('role').trim().notEmpty().withMessage('Role is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const existing = await Alumni.findOne({ userId: req.user._id });
    if (existing) return res.status(400).json({ error: 'Alumni profile already exists' });

    const data = { ...req.body, userId: req.user._id };
    if (typeof data.achievements === 'string') {
      data.achievements = data.achievements.split(',').map(a => a.trim()).filter(Boolean);
    }
    if (req.file) data.photo = req.file.path;

    const alumni = new Alumni(data);
    await alumni.save();

    const users = await User.find({ _id: { $ne: req.user._id } }).select('_id');
    const notifs = users.map(u => ({
      userId: u._id, type: 'alumni',
      message: `New alumni ${alumni.name} from ${alumni.company} joined CollabSphere`,
      relatedId: alumni._id, relatedModel: 'Alumni'
    }));
    if (notifs.length) await Notification.insertMany(notifs);

    res.status(201).json({ message: 'Alumni profile created', alumni });
  } catch (error) {
    console.error('Alumni error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all alumni (approved)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { batch, company, search, page = 1, limit = 12 } = req.query;
    const filter = { approved: true };
    if (batch) filter.batch = batch;
    if (company) filter.company = { $regex: company, $options: 'i' };
    if (search) filter.$text = { $search: search };

    const alumni = await Alumni.find(filter)
      .populate('userId', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(parseInt(limit));
    const total = await Alumni.countDocuments(filter);
    res.json({ alumni, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id).populate('userId', 'name profilePhoto email');
    if (!alumni) return res.status(404).json({ error: 'Not found' });
    res.json({ alumni });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update
router.put('/:id', auth, uploadProfile.single('photo'), localPathMiddleware('profiles'), async (req, res) => {
  try {
    const item = await Alumni.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (item.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not authorized' });

    const updates = { ...req.body };
    if (typeof updates.achievements === 'string') {
      updates.achievements = updates.achievements.split(',').map(a => a.trim()).filter(Boolean);
    }
    if (req.file) updates.photo = req.file.path;

    const updated = await Alumni.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json({ alumni: updated });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Alumni.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (item.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not authorized' });
    await Alumni.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
