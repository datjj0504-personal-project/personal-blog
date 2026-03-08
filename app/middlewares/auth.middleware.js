/**
 * Authentication Middleware
 * Validates JWT token and verifies it exists in token manager
 */

const jwt = require('jsonwebtoken');
const tokenManager = require('../services/tokenManager');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

/**
 * Middleware to verify JWT token and check if it's registered in token manager
 * Must be used on protected routes
 */
const authMiddleware = (req, res, next) => {
	try {
		// Get token from Authorization header
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

		// Check if token exists
		if (!token) {
			return res.status(401).json({
				success: false,
				message: 'Access token required'
			});
		}

		// Verify JWT signature
		const decoded = jwt.verify(token, JWT_SECRET);

		// Check if token exists in token manager (not expired/not revoked)
		if (!tokenManager.verifyToken(token)) {
			return res.status(401).json({
				success: false,
				message: 'Token has expired or is invalid'
			});
		}

		// Attach decoded user info to request
		req.user = decoded;
		req.token = token;

		next();
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			return res.status(401).json({
				success: false,
				message: 'Token has expired'
			});
		}

		if (error instanceof jwt.JsonWebTokenError) {
			return res.status(401).json({
				success: false,
				message: 'Invalid token'
			});
		}

		console.error('Auth middleware error:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error'
		});
	}
};

module.exports = authMiddleware;
