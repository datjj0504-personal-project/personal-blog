// [###]: Home routes definition: Define routes for the home page and other related endpoints

// [1]: Import necessary modules
const express        = require('express');
const router         = express.Router();
const homeController = require('../controllers/home.controller');

// [2]: Define route for the home page, which will be handled by the getHomePage method in the homeController
router.get('/', homeController.getHomePage);

// [3]: Export the router to be used in the main server file (app/server.js)
module.exports = router;