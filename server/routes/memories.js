const express = require('express');
const router = express.Router();
const MemoryEvent = require('../models/MemoryEvent');
const MemoryPhoto = require('../models/MemoryPhoto');
const MemoryComment = require('../models/MemoryComment');
const { auth, optionalAuth } = require('../middleware/auth');
const { uploadMemory } = require('../config/cloudinary');

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const isAdmin = (user) => ['admin', 'teacher'].includes(user.role);

// ─── YEARS & MONTH OVERVIEWS ─────────────────────────────────────────────────

// GET /api/memories/years
router.get('/years', async (req, res) => {
  try {
    const dbYears = await MemoryEvent.distinct('academicYear');
    const defaultYears = [2026, 2025, 2024, 2023];
    const merged = [...new Set([...dbYears, ...defaultYears])].sort((a, b) => b - a);
    res.json({ years: merged });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/memories/trending — must come before /:year to avoid conflict
router.get('/trending', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const photos = await MemoryPhoto.aggregate([
      { $match: { isApproved: true, createdAt: { $gte: thirtyDaysAgo } } },
      { $addFields: { likeCount: { $size: '$likes' } } },
      { $sort: { likeCount: -1, createdAt: -1 } },
      { $limit: 12 },
      {
        $lookup: {
          from: 'users', localField: 'userId',
          foreignField: '_id', as: 'userId'
        }
      },
      { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'memoryevents', localField: 'eventId',
          foreignField: '_id', as: 'eventId'
        }
      },
      { $unwind: { path: '$eventId', preserveNullAndEmptyArrays: true } },
      { $project: { 'userId.password': 0, 'userId.refreshToken': 0 } },
    ]);
    res.json({ photos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/memories/search?q=&year=
router.get('/search', async (req, res) => {
  try {
    const { q, year } = req.query;
    if (!q || q.trim() === '') return res.json({ photos: [], events: [] });

    const eventQuery = { isApproved: true, $text: { $search: q } };
    if (year) eventQuery.academicYear = parseInt(year);

    const matchedEvents = await MemoryEvent.find(eventQuery)
      .populate('createdBy', 'name profilePhoto')
      .limit(10)
      .sort({ score: { $meta: 'textScore' } });

    const photoQuery = { isApproved: true, $text: { $search: q } };
    if (year) {
      const evts = await MemoryEvent.find({ academicYear: parseInt(year) }).select('_id');
      photoQuery.eventId = { $in: evts.map(e => e._id) };
    }

    const photos = await MemoryPhoto.find(photoQuery)
      .populate('userId', 'name profilePhoto department year')
      .populate({ path: 'eventId', select: 'title academicYear month date' })
      .limit(20)
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 });

    res.json({ photos, events: matchedEvents });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/memories/events/:id — must come before /:year/:month to avoid conflict
router.get('/events/:id', optionalAuth, async (req, res) => {
  try {
    const event = await MemoryEvent.findById(req.params.id)
      .populate('createdBy', 'name profilePhoto role');
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const { page = 1, limit = 20, sort = 'newest', search = '' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    let query = { eventId: event._id, isApproved: true };
    if (search) query.$text = { $search: search };

    let photos, total;

    if (sort === 'mostLiked') {
      const agg = await MemoryPhoto.aggregate([
        { $match: query },
        { $addFields: { likeCount: { $size: '$likes' } } },
        { $sort: { likeCount: -1, createdAt: -1 } },
        { $skip: (pageNum - 1) * limitNum },
        { $limit: limitNum },
        { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userId' } },
        { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
        { $project: { 'userId.password': 0, 'userId.refreshToken': 0 } },
      ]);
      photos = agg;
      total = await MemoryPhoto.countDocuments(query);
    } else {
      const sortOpt = sort === 'oldest'
        ? { createdAt: 1 }
        : { isPinned: -1, isFeatured: -1, createdAt: -1 };
      photos = await MemoryPhoto.find(query)
        .populate('userId', 'name profilePhoto department year')
        .sort(sortOpt)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);
      total = await MemoryPhoto.countDocuments(query);
    }

    let myUploads = [];
    if (req.user) {
      myUploads = await MemoryPhoto.find({ eventId: event._id, userId: req.user._id })
        .populate('userId', 'name profilePhoto department year')
        .sort({ createdAt: -1 });
    }

    res.json({ event, photos, total, page: pageNum, pages: Math.ceil(total / limitNum), myUploads });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/memories/:year — 12 month summaries
router.get('/:year(\\d{4})', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const events = await MemoryEvent.find({ academicYear: year, isApproved: true })
      .populate('createdBy', 'name profilePhoto')
      .sort({ month: 1, date: 1 })
      .lean();

    const monthData = [];
    for (let m = 1; m <= 12; m++) {
      const monthEvents = events.filter(e => e.month === m);
      let totalPhotos = 0;
      const contributorsSet = new Set();
      let lastUpdated = null;

      if (monthEvents.length > 0) {
        const eventIds = monthEvents.map(e => e._id);
        const photos = await MemoryPhoto.find({ eventId: { $in: eventIds }, isApproved: true })
          .select('userId createdAt').lean();
        totalPhotos = photos.length;
        photos.forEach(p => contributorsSet.add(p.userId.toString()));
        if (photos.length > 0) {
          lastUpdated = photos.reduce((latest, p) =>
            p.createdAt > latest ? p.createdAt : latest, photos[0].createdAt);
        }
      }

      monthData.push({
        month: m,
        monthName: MONTHS[m - 1],
        events: monthEvents.map(e => ({
          _id: e._id,
          title: e.title,
          date: e.date,
          venue: e.venue,
          facultyCoordinator: e.facultyCoordinator,
          coverImage: e.coverImage,
          tags: e.tags,
        })),
        photoCount: totalPhotos,
        contributorCount: contributorsSet.size,
        lastUpdated,
      });
    }

    res.json({ year, months: monthData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/memories/:year/:month — events in a month
router.get('/:year(\\d{4})/:month(\\d{1,2})', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    const events = await MemoryEvent.find({ academicYear: year, month, isApproved: true })
      .populate('createdBy', 'name profilePhoto role')
      .sort({ date: 1 })
      .lean();

    const eventsWithCounts = await Promise.all(events.map(async (ev) => {
      const photoCount = await MemoryPhoto.countDocuments({ eventId: ev._id, isApproved: true });
      const contributors = await MemoryPhoto.distinct('userId', { eventId: ev._id, isApproved: true });
      return { ...ev, photoCount, contributorCount: contributors.length };
    }));

    res.json({ year, month, monthName: MONTHS[month - 1], events: eventsWithCounts });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── EVENTS CRUD ──────────────────────────────────────────────────────────────

// POST /api/memories/events — create event (admin/teacher)
router.post('/events', auth, async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ error: 'Only admin or faculty can create events' });
    }
    const { title, description, date, venue, academicYear, month, facultyCoordinator, tags, coverImage } = req.body;
    const event = new MemoryEvent({
      title, description, date, venue,
      academicYear: parseInt(academicYear),
      month: parseInt(month),
      facultyCoordinator: facultyCoordinator || '',
      coverImage: coverImage || '',
      tags: tags
        ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean))
        : [],
      createdBy: req.user._id,
    });
    await event.save();
    await event.populate('createdBy', 'name profilePhoto');
    res.status(201).json({ event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/memories/events/:id — update event
router.put('/events/:id', auth, async (req, res) => {
  try {
    const event = await MemoryEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (!isAdmin(req.user) && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const { title, description, date, venue, academicYear, month, facultyCoordinator, tags, coverImage } = req.body;
    if (title) event.title = title;
    if (description !== undefined) event.description = description;
    if (date) event.date = date;
    if (venue !== undefined) event.venue = venue;
    if (academicYear) event.academicYear = parseInt(academicYear);
    if (month) event.month = parseInt(month);
    if (facultyCoordinator !== undefined) event.facultyCoordinator = facultyCoordinator;
    if (coverImage !== undefined) event.coverImage = coverImage;
    if (tags !== undefined) {
      event.tags = Array.isArray(tags)
        ? tags
        : tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    await event.save();
    await event.populate('createdBy', 'name profilePhoto');
    res.json({ event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/memories/events/:id
router.delete('/events/:id', auth, async (req, res) => {
  try {
    const event = await MemoryEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (!isAdmin(req.user) && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const photos = await MemoryPhoto.find({ eventId: event._id }).select('_id');
    const photoIds = photos.map(p => p._id);
    if (photoIds.length > 0) {
      await MemoryComment.deleteMany({ photoId: { $in: photoIds } });
      await MemoryPhoto.deleteMany({ eventId: event._id });
    }
    await MemoryEvent.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event and all associated data deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── PHOTO UPLOAD ──────────────────────────────────────────────────────────────

// POST /api/memories/events/:id/photos — upload photos
router.post('/events/:id/photos', auth, uploadMemory.array('photos', 10), async (req, res) => {
  try {
    const event = await MemoryEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one photo is required' });
    }

    const { location, visibility } = req.body;
    const captions = req.body.captions
      ? (Array.isArray(req.body.captions) ? req.body.captions : [req.body.captions])
      : [];
    const tags = req.body.tags
      ? (Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags])
      : [];

    const savedPhotos = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const photo = new MemoryPhoto({
        eventId: event._id,
        userId: req.user._id,
        imageUrl: file.path,
        publicId: file.filename || '',
        caption: captions[i] || '',
        tags: tags[i] ? tags[i].split(',').map(t => t.trim()).filter(Boolean) : [],
        location: location || '',
        visibility: visibility || 'public',
      });
      await photo.save();
      savedPhotos.push(photo);
    }

    await MemoryPhoto.populate(savedPhotos, {
      path: 'userId', select: 'name profilePhoto department year'
    });
    res.status(201).json({ photos: savedPhotos, count: savedPhotos.length });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

// ─── PHOTO ACTIONS ────────────────────────────────────────────────────────────

// DELETE /api/memories/photos/:id
router.delete('/photos/:id', auth, async (req, res) => {
  try {
    const photo = await MemoryPhoto.findById(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    if (photo.userId.toString() !== req.user._id.toString() && !isAdmin(req.user)) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await MemoryComment.deleteMany({ photoId: photo._id });
    await MemoryPhoto.findByIdAndDelete(req.params.id);
    res.json({ message: 'Photo deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/memories/photos/:id — edit caption/tags/visibility
router.put('/photos/:id', auth, async (req, res) => {
  try {
    const photo = await MemoryPhoto.findById(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    if (photo.userId.toString() !== req.user._id.toString() && !isAdmin(req.user)) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const { caption, tags, visibility, isFeatured, isPinned } = req.body;
    if (caption !== undefined) photo.caption = caption;
    if (tags !== undefined) {
      photo.tags = Array.isArray(tags)
        ? tags
        : tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    if (visibility) photo.visibility = visibility;
    if (isAdmin(req.user)) {
      if (isFeatured !== undefined) photo.isFeatured = isFeatured;
      if (isPinned !== undefined) photo.isPinned = isPinned;
    }
    await photo.save();
    await photo.populate('userId', 'name profilePhoto department year');
    res.json({ photo });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/memories/photos/:id/like
router.post('/photos/:id/like', auth, async (req, res) => {
  try {
    const photo = await MemoryPhoto.findById(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    const idx = photo.likes.findIndex(id => id.toString() === req.user._id.toString());
    if (idx > -1) photo.likes.splice(idx, 1);
    else photo.likes.push(req.user._id);
    await photo.save();
    res.json({ liked: idx === -1, likesCount: photo.likes.length, likes: photo.likes });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/memories/photos/:id/report
router.post('/photos/:id/report', auth, async (req, res) => {
  try {
    const photo = await MemoryPhoto.findById(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    const already = photo.reports.some(
      r => r.reportedBy?.toString() === req.user._id.toString()
    );
    if (already) return res.status(400).json({ error: 'Already reported this photo' });
    photo.reports.push({ reportedBy: req.user._id, reason: req.body.reason || 'other' });
    await photo.save();
    res.json({ message: 'Photo reported. Our team will review it.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── COMMENTS ──────────────────────────────────────────────────────────────────

// GET /api/memories/photos/:id/comments
router.get('/photos/:id/comments', async (req, res) => {
  try {
    const topLevel = await MemoryComment.find({
      photoId: req.params.id, parentCommentId: null
    })
      .populate('userId', 'name profilePhoto department year')
      .sort({ isPinned: -1, createdAt: 1 });

    const withReplies = await Promise.all(topLevel.map(async (comment) => {
      const replies = await MemoryComment.find({ parentCommentId: comment._id })
        .populate('userId', 'name profilePhoto department year')
        .sort({ createdAt: 1 });
      return { ...comment.toObject(), replies };
    }));

    res.json({ comments: withReplies });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/memories/photos/:id/comments
router.post('/photos/:id/comments', auth, async (req, res) => {
  try {
    const { text, parentCommentId } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Comment text is required' });
    const photo = await MemoryPhoto.findById(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    const comment = new MemoryComment({
      photoId: req.params.id,
      userId: req.user._id,
      text: text.trim(),
      parentCommentId: parentCommentId || null,
    });
    await comment.save();
    await comment.populate('userId', 'name profilePhoto department year');
    res.status(201).json({ comment: { ...comment.toObject(), replies: [] } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/memories/comments/:id
router.delete('/comments/:id', auth, async (req, res) => {
  try {
    const comment = await MemoryComment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId.toString() !== req.user._id.toString() && !isAdmin(req.user)) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await MemoryComment.deleteMany({ parentCommentId: comment._id });
    await MemoryComment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/memories/comments/:id — edit own comment
router.put('/comments/:id', auth, async (req, res) => {
  try {
    const comment = await MemoryComment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    comment.text = req.body.text?.trim() || comment.text;
    comment.isEdited = true;
    await comment.save();
    await comment.populate('userId', 'name profilePhoto');
    res.json({ comment });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/memories/comments/:id/like
router.post('/comments/:id/like', auth, async (req, res) => {
  try {
    const comment = await MemoryComment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    const idx = comment.likes.findIndex(id => id.toString() === req.user._id.toString());
    if (idx > -1) comment.likes.splice(idx, 1);
    else comment.likes.push(req.user._id);
    await comment.save();
    res.json({ liked: idx === -1, likesCount: comment.likes.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
