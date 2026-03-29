// [1]: Load enviroment variables from .env file
require('dotenv').config();

// [2]: Import modules
//        express: Web framework for Node.js
//        cors: Middleware to enable Cross-Origin Resource Sharing (CORS)
//        db: Database models and connection (using Sequelize)
//        logger: Custom logging utility for consistent logging across the application
//        createLogger: Function to create a logger instance for a specific module (used for logging in this file)
// 	      LOG: Logger instance for the server module, used to log messages related to server operations and events
const express      = require('express');
const cors         = require('cors');
const db           = require("./models");
const logger       = require('./utilities/logger');
const createLogger = require('./utilities/logger');
const LOG          = createLogger('SERVER');
const tokenRealtimeManager = require('./services/tokenRealtimeManager');

// [3]: Create an Express application instance
//        This instance will be used to define routes and middleware for handling HTTP requests
const app = express();

// [4]: Middleware to read data JSON in request body (parse requests of content-type - application/json)
app.use(express.json());

// [5]: Middleware to allow front-end access
app.use(cors());

// [6]: Middleware to log incoming requests (for debugging and monitoring)
app.use((req, res, next) => {
	LOG.info(`HTTP REQUEST: ${req.method} ${req.url}`);
	next();
});

// [7]: ENV PATH API
const PORT       = process.env.SERVER_PORT || 8000;
const IP_ADDRESS = process.env.IP_ADDRESS || 'localhost';
const BASE_PATH  = process.env.BASE_PATH || '/datnt/blog/server';

// [8]: Routes definition: Import and use routes defined in separate files for better organization and maintainability
const homeRoutes   = require('./routes/home.routes');
const authRoutes   = require('./routes/auth.routes');
const systemRoutes = require('./routes/system.routes');
const postsRoutes  = require('./routes/posts.routes');
app.use(BASE_PATH, homeRoutes);
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/system`, systemRoutes);
app.use(`${BASE_PATH}/posts`, postsRoutes);

// [9]: Start the server and connect to the database
(async () => {
	try {
		// [9-1]: Connect database
		await db.sequelize.authenticate();
		LOG.info("Connected to MySQL successfully!");

		// [9-2]: Create/update tables if NOT existed
		await db.sequelize.sync({ alter: true });
		LOG.info("Tables checked (created if not exists)");

		// [9-2-A]: Clear realtime token table on startup
		await db.tbManageTokenRealtime.destroy({ where: {}, truncate: true });
		LOG.info("Realtime token table cleared on startup");

		// [9-2-B]: Start realtime token sync (every 5s)
		tokenRealtimeManager.start();
		
		// [9-3]: Define port
		const PORT = process.env.SERVER_PORT || 8000;

		// [9-4]: Start-up server
		app.listen(PORT, () => {
			LOG.info(`Server is running on http://localhost:${PORT}`);
		});
	} catch (error) {
		LOG.error("Unable to connect to the database:");
		LOG.error("SERVER", error.message);
		process.exit(1);
	}
})();
