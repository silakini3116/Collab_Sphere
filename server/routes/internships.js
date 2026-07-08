const express = require('express');
const { body, validationResult } = require('express-validator');
const Internship = require('../models/Internship');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');
const { requireVerified } = require('../middleware/rbac');
const { uploadDocument } = require('../config/cloudinary');

const router = express.Router();

// Create internship
router.post('/', auth, requireVerified, uploadDocument.fields([
  { name: 'certificate', maxCount: 1 },
  { name: 'offerLetter', maxCount: 1 }
]), [
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('role').trim().notEmpty().withMessage('Role is required'),
  body('duration').trim().notEmpty().withMessage('Duration is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('paidOrUnpaid').isIn(['Paid', 'Unpaid']).withMessage('Specify paid or unpaid'),
  body('selectionProcess').trim().notEmpty().withMessage('Selection process is required'),
  body('experience').trim().notEmpty().withMessage('Experience is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const data = { ...req.body, postedBy: req.user._id };
    if (typeof data.interviewQuestions === 'string') {
      data.interviewQuestions = data.interviewQuestions.split(',').map(q => q.trim()).filter(Boolean);
    }
    if (typeof data.skillsRequired === 'string') {
      data.skillsRequired = data.skillsRequired.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (req.files?.certificate) data.certificate = req.files.certificate[0].path;
    if (req.files?.offerLetter) data.offerLetter = req.files.offerLetter[0].path;

    const internship = new Internship(data);
    await internship.save();

    const users = await User.find({ _id: { $ne: req.user._id } }).select('_id');
    const notifs = users.map(u => ({
      userId: u._id, type: 'internship',
      message: `New internship experience at ${internship.company} shared by ${req.user.name}`,
      relatedId: internship._id, relatedModel: 'Internship'
    }));
    if (notifs.length) await Notification.insertMany(notifs);

    await internship.populate('postedBy', 'name role year profilePhoto');
    res.status(201).json({ message: 'Internship posted', internship });
  } catch (error) {
    console.error('Internship error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { company, search, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (company) filter.company = { $regex: company, $options: 'i' };
    if (search) filter.$text = { $search: search };

    const internships = await Internship.find(filter)
      .populate('postedBy', 'name role year profilePhoto')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(parseInt(limit));
    const total = await Internship.countDocuments(filter);
    res.json({ internships, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate('postedBy', 'name role year profilePhoto department')
      .populate('comments.user', 'name profilePhoto');
    if (!internship) return res.status(404).json({ error: 'Not found' });
    res.json({ internship });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Internship.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not authorized' });

    const updated = await Internship.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('postedBy', 'name role year profilePhoto');
    res.json({ internship: updated });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Internship.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not authorized' });
    await Internship.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const item = await Internship.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    const idx = item.likes.indexOf(req.user._id);
    if (idx > -1) { item.likes.splice(idx, 1); } else { item.likes.push(req.user._id); }
    await item.save();
    res.json({ liked: idx === -1, likesCount: item.likes.length });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Comment
router.post('/:id/comment', auth, [
  body('text').trim().notEmpty().withMessage('Required')
], async (req, res) => {
  try {
    const item = await Internship.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    item.comments.push({ user: req.user._id, text: req.body.text });
    await item.save();
    await item.populate('comments.user', 'name profilePhoto');
    res.json({ comments: item.comments });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
