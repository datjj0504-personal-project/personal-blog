// [###]: Posts routes definition: Define routes for post creation

// [1]: Import necessary modules
const express = require("express");
const router = express.Router();
const postsController = require("../controllers/posts.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// [2]: Define route for creating a post (requires authentication)
router.post("/create", authMiddleware, postsController.createPost);

// [3]: Define route for toggle like/unlike (requires authentication)
router.post("/like", authMiddleware, postsController.toggleLike);

// [4]: Define route for creating a comment (requires authentication)
router.post("/comment", authMiddleware, postsController.createComment);

// [5]: Export the router to be used in the main server file (app/server.js)
module.exports = router;
