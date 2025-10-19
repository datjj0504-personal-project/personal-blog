// Import modules
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const db      = require("./models");

// Create app express
const app = express();

// Middleware to read data JSON in request body (parse requests of content-type - application/json)
app.use(express.json());
// Allow front-end access
app.use(cors());

(async () => {
	try {
		// [1]: Connect database
		await db.sequelize.authenticate();
		console.log("✅ Connected to MySQL successfully!");

		// [2]: Create table users if NOT existed
		await db.sequelize.sync();
		console.log("✅ User table checked (created if not exists)");
		
		// [3]:Define port
		const PORT = process.env.SERVER_PORT || 8000;

		// [4]: Start-up server
		app.listen(PORT, () => {
			console.log(`✅ Server is running on http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error("❌ Unable to connect to the database:", error.message);
		process.exit(1);
	}
})();

// Routes
const homeRoutes = require('./routes/home.routes');
app.use('/', homeRoutes);