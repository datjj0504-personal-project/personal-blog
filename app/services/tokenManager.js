/**
 * Token Manager Service
 * Manages token storage with automatic expiration
 * Stores token and automatically deletes it after expiresIn time
 */

// [1]: Import necessary modules (none needed for basic implementation)
const logger       = require('../utilities/logger');
const createLogger = require('../utilities/logger');
const LOG          = createLogger('TOKEN MANAGER');

// [2]: Define the TokenManager class
class TokenManager {
	constructor() {
		// Store: { token: { username, expiresAt, timeoutId } }
		this.tokens = new Map();
	}

	/**
	 * Save token with auto-expiration
	 * @param {string} token - JWT token
	 * @param {string} username - Username associated with token
	 * @param {number} expiresInHours - Token expiration time in hours
	 */
	saveToken(token, username, expiresInHours = 1) {
		// Remove old token if exists
		if (this.tokens.has(token)) {
			this.removeToken(token);
		}

		// Calculate expiration time in milliseconds
		const expiresAtMs = expiresInHours * 60 * 60 * 1000;
		const expiresAt = new Date(Date.now() + expiresAtMs);

		// Set auto-delete timeout
		const timeoutId = setTimeout(() => {
			this.removeToken(token);
			LOG.info(`Token for user '${username}' has expired and been removed`);
		}, expiresAtMs);

		// Store token info
		this.tokens.set(token, {
			username,
			expiresAt,
			timeoutId
		});

		LOG.info(`Token saved for user '${username}', expires at: ${expiresAt.toISOString()}`);
	}

	/**
	 * Verify if token is valid and exists
	 * @param {string} token - JWT token to verify
	 * @returns {boolean} - True if token is valid, false otherwise
	 */
	verifyToken(token) {
		return this.tokens.has(token);
	}

	/**
	 * Get token info
	 * @param {string} token - JWT token
	 * @returns {Object|null} - Token info or null if not found
	 */
	getTokenInfo(token) {
		return this.tokens.get(token) || null;
	}

	/**
	 * Remove token immediately
	 * @param {string} token - JWT token to remove
	 */
	removeToken(token) {
		const tokenInfo = this.tokens.get(token);
		if (tokenInfo) {
			// Clear timeout
			clearTimeout(tokenInfo.timeoutId);
			// Delete from storage
			this.tokens.delete(token);
			LOG.info(`Token removed for user '${tokenInfo.username}'`);
		}
	}

	/**
	 * Logout user by removing their token
	 * @param {string} token - JWT token
	 */
	logout(token) {
		this.removeToken(token);
	}

	/**
	 * Get all active tokens (for debugging/monitoring)
	 * @returns {Array} - Array of token info
	 */
	getAllTokens() {
		const allTokens = [];
		this.tokens.forEach((info, token) => {
			allTokens.push({
				token: token.substring(0, 10) + '...', // Show only first 10 chars for security
				username: info.username,
				expiresAt: info.expiresAt
			});
		});
		return allTokens;
	}
}

// [3]: Export singleton instance
module.exports = new TokenManager();
