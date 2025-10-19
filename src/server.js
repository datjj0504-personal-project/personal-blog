// Import modules
require('dotenv').config();
const express = require('express');

// Create app express
const app = express();

// Define config
const PORT = process.env.SERVER_PORT || 8000;

// Middleware to read data JSON in request body
app.use(express.json());

// 
app.get('/', (req, res) => {
	res.send('🚀 Server is running with .env setup!');
});

app.listen(PORT, () => {
	console.log(`✅ Server is running on http://localhost:${PORT}`);
});

