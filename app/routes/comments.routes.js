const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/comment", authMiddleware, commentsController.createComment);

module.exports = router;
