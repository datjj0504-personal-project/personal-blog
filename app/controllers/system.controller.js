// [###]: System controller definition: Define controller functions for handling requests related to system status and other related endpoints

// [1]: Import necessary modules
const logger       = require('../utilities/logger');
const createLogger = require('../utilities/logger');
const LOG          = createLogger('SYSTEM CTLR');

// [2]: Define controller function for handling requests to the system status endpoint
exports.getSystemStatus = (req, res) => {
	LOG.info('Received request for system status ...');
	res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
};