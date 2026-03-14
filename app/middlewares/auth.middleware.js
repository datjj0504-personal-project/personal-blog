/**
 * Authentication Middleware
 * Validates JWT token and verifies it exists in token manager
 */

// [1]: Import necessary modules
const jwt          = require('jsonwebtoken');
const tokenManager = require('../services/tokenManager');
const JWT_SECRET   = process.env.JWT_SECRET || 'your_jwt_secret_key';
const logger       = require('../utilities/logger');
const createLogger = require('../utilities/logger');
const LOG          = createLogger('AUTH MIDDLEWARE');

/**
 * Middleware to verify JWT token and check if it's registered in token manager
 * Must be used on protected routes
 */

// [2]: Define the authentication middleware function
const authMiddleware = (req, res, next) => {
	try {
		// [2-1]: Get token from Authorization header
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

		// [2-2]: Check if token exists
		if (!token) {
			LOG.warn('Attempt to access protected route without a token');
			return res.status(401).json({
				success: false,
				message: 'Access token required'
			});
		}

		// [2-3]: Verify JWT signature
		const decoded = jwt.verify(token, JWT_SECRET);

		// [2-4]: Check if token exists in token manager (not expired/not revoked)
		if (!tokenManager.verifyToken(token)) {
			LOG.warn('Attempt to access protected route with invalid token');
			return res.status(401).json({
				success: false,
				message: 'Token has expired or is invalid'
			});
		}

		// [2-5]: Attach decoded user info to request
		req.user = decoded;
		req.token = token;

		next();
	} catch (error) {
		// Handle specific JWT errors for better client feedback
		LOG.error('Auth middleware error:', error);
		if (error instanceof jwt.TokenExpiredError) {
			LOG.warn('Attempt to access protected route with expired token');
			return res.status(401).json({
				success: false,
				message: 'Token has expired'
			});
		}

		// Handle invalid token error
		if (error instanceof jwt.JsonWebTokenError) {
			LOG.warn('Attempt to access protected route with invalid token');
			return res.status(401).json({
				success: false,
				message: 'Invalid token'
			});
		}

		// General error handling
		LOG.error('Auth middleware error:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error'
		});
	}
};

// [3]: Export the authentication middleware function for use in routes
module.exports = authMiddleware;
