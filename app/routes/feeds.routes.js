// [###]: Feeds routes definition: Define routes for feeds resources

// [1]: Import necessary modules
const express = require("express");
const router = express.Router();
const feedsController = require("../controllers/feeds.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// [2]: Define route for feeds resources (requires authentication)
router.get("/resources", authMiddleware, feedsController.getResources);

// [3]: Export the router to be used in the main server file (app/server.js)
module.exports = router;
