// [###]: Auth routes definition: Define routes for user authentication (registration, login, logout) and related endpoints

// [1]: Import necessary modules
const express        = require('express');
const router         = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// [2]: Define routes for user registration, login, and logout, with appropriate controllers and middleware
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authMiddleware, authController.logout);

// [3]: Export the router to be used in the main server file (app/server.js)
module.exports = router;