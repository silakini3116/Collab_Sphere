const express = require('express');
const User = require('../models/User');
const Event = require('../models/Event');
const Project = require('../models/Project');
const Internship = require('../models/Internship');
const Gallery = require('../models/Gallery');
const Alumni = require('../models/Alumni');
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

// All admin routes require admin role
router.use(auth, authorize('admin'));

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [users, events, projects, internships, galleries, alumni] = await Promise.all([
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Event.countDocuments(),
      Project.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Internship.aggregate([{ $group: { _id: '$company', count: { $sum: 1 } } }]),
      Gallery.countDocuments(),
      Alumni.countDocuments()
    ]);

    const usersByRole = {};
    users.forEach(u => { usersByRole[u._id] = u.count; });

    res.json({
      users: { total: Object.values(usersByRole).reduce((a, b) => a + b, 0), byRole: usersByRole },
      events, projects: { total: projects.reduce((a, b) => a + b.count, 0), byCategory: projects },
      internships: { total: internships.reduce((a, b) => a + b.count, 0), byCompany: internships.slice(0, 10) },
      galleries, alumni
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve teacher
router.patch('/users/:id/verify', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { verified: true }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: `${user.name} has been verified`, user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve alumni
router.patch('/alumni/:id/approve', async (req, res) => {
  try {
    const alumni = await Alumni.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    if (!alumni) return res.status(404).json({ error: 'Alumni not found' });
    res.json({ message: 'Alumni approved', alumni });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Pending approvals
router.get('/pending', async (req, res) => {
  try {
    const [teachers, alumniProfiles] = await Promise.all([
      User.find({ role: 'teacher', verified: false }),
      Alumni.find({ approved: false }).populate('userId', 'name email')
    ]);
    res.json({ pendingTeachers: teachers, pendingAlumni: alumniProfiles });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete any event
router.delete('/events/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete any project
router.delete('/projects/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users for management
router.get('/users', async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }
    const users = await User.find(filter).sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(parseInt(limit));
    const total = await User.countDocuments(filter);
    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
