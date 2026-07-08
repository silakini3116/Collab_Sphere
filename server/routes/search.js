const express = require('express');
const Event = require('../models/Event');
const Project = require('../models/Project');
const Internship = require('../models/Internship');
const Alumni = require('../models/Alumni');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Global search across all modules
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { q, page = 1, limit = 5 } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    const skip = (page - 1) * limit;

    const [events, projects, internships, alumni] = await Promise.all([
      Event.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { organizer: searchRegex },
          { category: searchRegex },
          { venue: searchRegex }
        ]
      }).populate('postedBy', 'name role year profilePhoto')
        .sort({ createdAt: -1 }).limit(parseInt(limit)),

      Project.find({
        $or: [
          { title: searchRegex },
          { overview: searchRegex },
          { techStack: searchRegex },
          { 'rolesNeeded.role': searchRegex },
          { 'rolesNeeded.skills': searchRegex },
          { category: searchRegex }
        ]
      }).populate('postedBy', 'name role year profilePhoto')
        .sort({ createdAt: -1 }).limit(parseInt(limit)),

      Internship.find({
        $or: [
          { company: searchRegex },
          { role: searchRegex },
          { skillsRequired: searchRegex },
          { experience: searchRegex }
        ]
      }).populate('postedBy', 'name role year profilePhoto')
        .sort({ createdAt: -1 }).limit(parseInt(limit)),

      Alumni.find({
        approved: true,
        $or: [
          { name: searchRegex },
          { company: searchRegex },
          { role: searchRegex },
          { experience: searchRegex }
        ]
      }).populate('userId', 'name profilePhoto')
        .sort({ createdAt: -1 }).limit(parseInt(limit))
    ]);

    res.json({
      query: q,
      results: { events, projects, internships, alumni },
      counts: {
        events: events.length,
        projects: projects.length,
        internships: internships.length,
        alumni: alumni.length,
        total: events.length + projects.length + internships.length + alumni.length
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
