const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const requestController = require('../controllers/projectRequestController');
const { createRequestValidator, respondRequestValidator } = require('../validators/projectRequestValidators');

// Order is important so /requests/mine is not treated as /:projectId/requests
router.get('/requests/mine', auth, requestController.getMyRequests);

router.post('/:projectId/requests', auth, createRequestValidator, requestController.createRequest);
router.get('/:projectId/requests', auth, requestController.getRequestsForProject);
router.patch('/:projectId/requests/:requestId', auth, respondRequestValidator, requestController.respondToRequest);

module.exports = router;
