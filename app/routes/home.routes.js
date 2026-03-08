const express        = require('express');
const router         = express.Router();
const homeController = require('../controllers/home.controller');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', homeController.getHomePage);

// FE access
router.all('/fe_access', (req, res) => {
	console.log('Frontend access detected...');
	res.send('Frontend access detected');
});

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;