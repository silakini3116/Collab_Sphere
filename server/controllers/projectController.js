const Project = require('../models/Project');

const createProject = async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      postedBy: req.user._id
    });
    await project.save();
    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error('Create project error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: messages[0], details: messages });
    }
    res.status(500).json({ error: error.message || 'Server error creating project' });
  }
};

const getProjects = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const filter = {};

    if (category && category !== 'all') filter.category = category;
    if (search) {
      filter.$text = { $search: search };
    }

    const projects = await Project.find(filter)
      .select('-contact')
      .populate('postedBy', 'name role year profilePhoto department')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(filter);

    res.json({ projects, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching projects' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .select('-contact')
      .populate('postedBy', 'name role year profilePhoto department email');

    if (!project) return res.status(404).json({ error: 'Project not found' });

    res.json({ project });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updates = {
      ...req.body,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    };

    const updated = await Project.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .select('-contact')
      .populate('postedBy', 'name role year profilePhoto');

    res.json({ message: 'Project updated', project: updated });
  } catch (error) {
    console.error('Update project error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: messages[0], details: messages });
    }
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
};
