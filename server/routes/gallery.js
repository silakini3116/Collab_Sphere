const express = require('express');
const Gallery = require('../models/Gallery');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');
const { uploadGallery, localPathMiddleware } = require('../config/cloudinary');

const router = express.Router();

// Upload photos to album
router.post('/', auth, uploadGallery.array('images', 20), localPathMiddleware('gallery'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one image is required' });
    }
    const { year, album, caption } = req.body;
    if (!year || !album) return res.status(400).json({ error: 'Year and album are required' });

    const images = req.files.map((f, i) => ({
      url: f.path, publicId: f.filename,
      caption: req.body[`caption_${i}`] || caption || ''
    }));

    const gallery = new Gallery({ year: parseInt(year), album, images, caption: caption || '', uploadedBy: req.user._id });
    await gallery.save();

    const users = await User.find({ _id: { $ne: req.user._id } }).select('_id');
    const notifs = users.map(u => ({
      userId: u._id, type: 'gallery',
      message: `New photos added to ${album} ${year} by ${req.user.name}`,
      relatedId: gallery._id, relatedModel: 'Gallery'
    }));
    if (notifs.length) await Notification.insertMany(notifs);

    await gallery.populate('uploadedBy', 'name profilePhoto');
    res.status(201).json({ message: 'Photos uploaded', gallery });
  } catch (error) {
    console.error('Gallery error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get years
router.get('/years', async (req, res) => {
  try {
    const years = await Gallery.distinct('year');
    res.json({ years: years.sort((a, b) => b - a) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get albums by year
router.get('/year/:year', async (req, res) => {
  try {
    const albums = await Gallery.aggregate([
      { $match: { year: parseInt(req.params.year) } },
      { $group: { _id: '$album', count: { $sum: { $size: '$images' } }, latestImage: { $last: { $arrayElemAt: ['$images', 0] } } } },
      { $sort: { _id: 1 } }
    ]);
    res.json({ albums, year: parseInt(req.params.year) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get album photos
router.get('/year/:year/:album', optionalAuth, async (req, res) => {
  try {
    const galleries = await Gallery.find({ year: parseInt(req.params.year), album: req.params.album })
      .populate('uploadedBy', 'name profilePhoto')
      .populate('comments.user', 'name profilePhoto')
      .sort({ createdAt: -1 });
    res.json({ galleries });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all gallery entries (for homepage)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const galleries = await Gallery.find()
      .populate('uploadedBy', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(parseInt(limit));
    const total = await Gallery.countDocuments();
    res.json({ galleries, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    const idx = item.likes.indexOf(req.user._id);
    if (idx > -1) item.likes.splice(idx, 1); else item.likes.push(req.user._id);
    await item.save();
    res.json({ liked: idx === -1, likesCount: item.likes.length });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    item.comments.push({ user: req.user._id, text: req.body.text });
    await item.save();
    await item.populate('comments.user', 'name profilePhoto');
    res.json({ comments: item.comments });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (item.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not authorized' });
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
