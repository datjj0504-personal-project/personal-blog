// [###]: Home controller definition: Define controller functions for handling requests related to the home page and other related endpoints

// [1]: Import necessary modules
const logger       = require('../utilities/logger');
const createLogger = require('../utilities/logger');
const LOG          = createLogger('HOME CTLR');

// [2]: Define controller function for handling requests to the home page
exports.getHomePage = (req, res) => {
	LOG.info('Received request to home page ...');
	res.status(200).json({ message: 'Welcome to the Personal Blog API!' });
};