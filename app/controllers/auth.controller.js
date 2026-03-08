const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi"); // [1] Import Joi for advanced input validation
const tokenManager = require("../services/tokenManager"); // Import token manager for token storage

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"; // Use environment variable in production

// [1] Define validation schemas using Joi for better input validation
const registerSchema = Joi.object({
	username: Joi.string().min(3).max(50).pattern(/^[a-zA-Z0-9_]+$/).required().messages({
		'string.pattern.base': '	',
		'string.min': 'Username must be at least 3 characters',
		'string.max': 'Username must be at most 50 characters',
		'any.required': 'Username is required'
	}),
	password: Joi.string().min(6).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required().messages({
		'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
		'string.min': 'Password must be at least 6 characters',
		'any.required': 'Password is required'
	})
});

const loginSchema = Joi.object({
	username: Joi.string().required().messages({
		'any.required': 'Username is required'
	}),
	password: Joi.string().required().messages({
		'any.required': 'Password is required'
	})
});

module.exports = {
	// User registration
	register: async (req, res) => {
		console.log('Register endpoint hit with body:', req.body);
		try {
			// [1] Validate input using Joi schema
			const { error, value } = registerSchema.validate(req.body);
			if (error) {
				return res.status(422).json({ success: false, message: error.details[0].message });
			}
			const { username, password } = value;

			// [2] Check if user already exists (additional check for robustness)
			const existingUser = await db.listUsers.findByPk(username);
			if (existingUser) {
				return res.status(409).json({ success: false, message: "Username already exists" });
			}

			// [3] Hash password with bcrypt
			const hashedPassword = await bcrypt.hash(password, 10);

			// [4] Create user and handle database errors specifically
			let newUser;
			try {
				newUser = await db.listUsers.create({ username, password: hashedPassword });
			} catch (dbError) {
				// [2] Handle specific database errors
				if (dbError.name === 'SequelizeUniqueConstraintError') {
					return res.status(409).json({ success: false, message: "Username already exists" });
				}
				throw dbError; // Re-throw for general error handling
			}

			console.log('Register user successfully:', newUser.username);
			// [3] Return consistent response format
			return res.status(201).json({
				success: true,
				message: 'User registered successfully',
				data: { user: { username: newUser.username } }
			});

		} catch (error) {
			console.error('Registration error:', error);
			// [4] General error handling with consistent format
			return res.status(500).json({ success: false, message: 'Internal server error' });
		}
	},

	// User login
	login: async (req, res) => {
		console.log('Login endpoint hit with body:', req.body);
		try {
			// [1] Validate input using Joi schema
			const { error, value } = loginSchema.validate(req.body);
			if (error) {
				return res.status(422).json({ success: false, message: error.details[0].message });
			}
			const { username, password } = value;

			// [2] Find user
			const user = await db.listUsers.findByPk(username);
			if (!user) {
				return res.status(401).json({ success: false, message: 'Invalid credentials' });
			}

			// [3] Check password with bcrypt
			const isPasswordValid = await bcrypt.compare(password, user.password);
			if (!isPasswordValid) {
				return res.status(401).json({ success: false, message: 'Invalid credentials' });
			}

			// [4] Generate JWT token with expiration info
			const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });

			// [4.5] Save token to token manager with auto-expiration (1 hour)
			tokenManager.saveToken(token, user.username, 1); // 1 hour

			console.log('Login successful for user:', user.username);
			// [5] Return consistent response format with token details
			return res.status(200).json({
				success: true,
				message: 'Login successful',
				data: {
					user: { username: user.username },
					token: token,
					expiresIn: 1 // [4] Add expiration info for client
				}
			});

		} catch (error) {
			console.error('Login error:', error);
			// [4] General error handling
			return res.status(500).json({ success: false, message: 'Internal server error' });
		}
	},

	// User logout
	logout: (req, res) => {
		try {
			const token = req.headers['authorization']?.split(' ')[1];
			
			if (!token) {
				return res.status(400).json({
					success: false,
					message: 'No token provided'
				});
			}

			// Remove token from token manager
			tokenManager.logout(token);

			console.log('Logout successful for user:', req.user?.username);
			return res.status(200).json({
				success: true,
				message: 'Logout successful'
			});

		} catch (error) {
			console.error('Logout error:', error);
			return res.status(500).json({
				success: false,
				message: 'Internal server error'
			});
		}
	}
};