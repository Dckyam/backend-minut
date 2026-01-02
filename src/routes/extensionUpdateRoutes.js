const express = require('express');
const router = express.Router();
const extensionUpdateController = require('../controllers/extensionUpdateController');

// SSE endpoint - real-time update stream
router.get('/stream', (req, res) => {
  extensionUpdateController.streamUpdates(req, res);
});

// Manual trigger update notification (for testing/admin)
router.post('/trigger', async (req, res) => {
  await extensionUpdateController.triggerUpdate(req, res);
});

// Get connection stats
router.get('/stats', (req, res) => {
  extensionUpdateController.getStats(req, res);
});

module.exports = router;
