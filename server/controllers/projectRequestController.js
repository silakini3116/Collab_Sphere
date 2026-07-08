const ProjectRequest = require('../models/ProjectRequest');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

const createRequest = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const project = await Project.findById(projectId);

    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (project.postedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot request to join your own project' });
    }

    const existingRequest = await ProjectRequest.findOne({ project: projectId, applicant: req.user._id });
    if (existingRequest) {
      return res.status(400).json({ error: 'You have already submitted a request for this project' });
    }

    const request = new ProjectRequest({
      project: projectId,
      applicant: req.user._id,
      note: req.body.note
    });

    await request.save();

    await new Notification({
      userId: project.postedBy,
      type: 'project_interest',
      message: `${req.user.name} wants to join your project "${project.title}"`,
      relatedId: project._id,
      relatedModel: 'Project'
    }).save();

    res.status(201).json({ message: 'Request sent successfully', request });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already requested to join this project' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

const getRequestsForProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const requests = await ProjectRequest.find({ project: req.params.projectId })
      .populate('applicant', 'name profilePhoto year department skills email')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await ProjectRequest.find({ applicant: req.user._id })
      .populate({
        path: 'project',
        select: 'title overview category contact postedBy',
        populate: { path: 'postedBy', select: 'name profilePhoto' }
      })
      .sort({ createdAt: -1 });

    const processedRequests = requests.map(reqDoc => {
      const doc = reqDoc.toObject();
      if (doc.status !== 'accepted' && doc.project) {
        delete doc.project.contact;
      }
      return doc;
    });

    res.json({ requests: processedRequests });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const respondToRequest = async (req, res) => {
  try {
    const { projectId, requestId } = req.params;
    const { status } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const request = await ProjectRequest.findById(requestId);
    if (!request || request.project.toString() !== projectId) {
      return res.status(404).json({ error: 'Request not found' });
    }

    request.status = status;
    request.respondedAt = new Date();
    await request.save();

    // Populate applicant details so frontend gets email immediately
    await request.populate('applicant', 'name profilePhoto year department skills email');

    const message = status === 'accepted'
      ? `Your request to join "${project.title}" was accepted! Contact info is now unlocked.`
      : `Your request to join "${project.title}" was declined.`;

    // Save notification — non-blocking so it doesn't break the response
    new Notification({
      userId: request.applicant._id || request.applicant,
      type: 'project_response',
      message,
      relatedId: project._id,
      relatedModel: 'Project'
    }).save().catch(err => console.error('Notification save error:', err.message));

    res.json({ message: `Request ${status}`, request });
  } catch (error) {
    console.error('respondToRequest error:', error.message, error.stack);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

module.exports = {
  createRequest,
  getRequestsForProject,
  getMyRequests,
  respondToRequest
};
