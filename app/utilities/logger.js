// [###]: Logger utility for consistent logging across the application

// [1]: Import necessary modules
const { func } = require('joi');
const path = require('path');

// [2]: Define log levels and current log level
const LOG_LEVELS = {
	DEBUG: 0,
	INFO: 1,
	WARN: 2,
	ERROR: 3
};
const CURRENT_LOG_LEVEL = LOG_LEVELS.DEBUG; // Change this to set minimum log level

// [3]: column witdh
const LEVEL_WIDTH = 5;
const MODULE_WIDTH = 15;

// [4]: Get current time
function getTime() {
	const now = new Date();
	return now.toISOString();
};

// [5]: Format log message
function formatMessage(args) {
	if (args.length === 0) return '';
	return args.map(arg => {
		if (typeof arg === 'object') {
			if (typeof arg === "object") {
				return JSON.stringify(arg, null, 2);
			}
		}
		return arg;
	}).join(' ');
};

// [6]: Write log message to console
function writeLog(level, module, ...args) {
	const time = getTime();
	const levelCol = level.padEnd(LEVEL_WIDTH); // Pad level to fixed width
	const moduleCol = module.padEnd(MODULE_WIDTH); // Pad module to fixed width
	const message = formatMessage(args);
	console.log(
		`[${time}] [${levelCol}] [${moduleCol}]: ${message}`
	);
};

// [7]: Create module logger
function createLogger(moduleName) {

	return {

		debug: (...args) => writeLog("DEBUG", moduleName, ...args),

		info: (...args) => writeLog("INFO", moduleName, ...args),

		warn: (...args) => writeLog("WARN", moduleName, ...args),

		error: (...args) => writeLog("ERROR", moduleName, ...args),

	};

}

// [8]: Export the createLogger function for use in other modules
module.exports = createLogger;