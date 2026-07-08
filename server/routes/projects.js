const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middleware/auth');
const projectController = require('../controllers/projectController');
const { createProjectValidator, updateProjectValidator, getProjectValidator, deleteProjectValidator } = require('../validators/projectValidators');
const requestRoutes = require('./projectRequestRoutes');

// Project Request Routes
router.use('/', requestRoutes);

// Project routes
router.post('/', auth, createProjectValidator, projectController.createProject);
router.get('/', optionalAuth, projectController.getProjects);
router.get('/:id', optionalAuth, getProjectValidator, projectController.getProjectById);
router.patch('/:id', auth, updateProjectValidator, projectController.updateProject);
router.delete('/:id', auth, deleteProjectValidator, projectController.deleteProject);

module.exports = router;
