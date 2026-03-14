// [###]: System routes definition: Define routes for system-related endpoints (e.g., health check, status)

// [1]: Import necessary modules
const express = require('express');
const router = express.Router();
const systemController = require('../controllers/system.controller');

// [2]: Define route for health check, which will return a simple status message and timestamp
router.get('/health', systemController.getSystemStatus);

// [3]: Export the router to be used in the main server file (app/server.js)
module.exports = router;