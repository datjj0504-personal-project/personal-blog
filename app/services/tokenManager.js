// [###]: TokenManager service to handle token storage, validation, and expiration

// [1]: Import necessary modules (none needed for basic implementation)
const createLogger = require('../utilities/logger');
const LOG          = createLogger('TOKEN MANAGER');
const TOKEN_EXPIRATION_HOURS = parseFloat(process.env.TOKEN_EXPIRATION_HOURS) || 1; // Default to 1 hour if not set

// [2]: Define the TokenManager class to handle token storage, validation, and expiration
class TokenManager {
	// [2-1]: Constructor initializes the token storage
	constructor() {

		// username -> session
		this.sessions = new Map();
	};

	// [2-2]: Save a token for a user, with an optional expiration time (default from env variable)
	saveToken(token, username, expirationHours = TOKEN_EXPIRATION_HOURS) {
		if(this.sessions.has(username)) {
			this.logout(username);
		}

		const expiresMs = expirationHours * 60 * 60 * 1000;
		const expiresAt = new Date(Date.now() + expiresMs);

		const timeoutId = setTimeout(() => {
			this.logout(username);
			LOG.info(`Session expired for user '${username}' and has been removed`);
		}, expiresMs);

		this.sessions.set(username, {
			token,
			username,
			expiresAt,
			timeoutId
		});
		LOG.info(`Token saved for user '${username}', expires at: ${expiresAt.toISOString()}`);
	};

	// [2-3]: Validate a token by checking if it exists in the sessions map
	validateToken(token) {
		for (const session of this.sessions.values()) {
			if (session.token === token) {
				return true;
			}
		}
		return false;
	};

	// [2-4]: Logout a user by clearing their session and removing it from the map
	logout(username) {
		const session = this.sessions.get(username);
		if(!session) {
			LOG.warn(`Attempt to logout user '${username}' who has no active session`);
			return;
		}
		clearTimeout(session.timeoutId);
		this.sessions.delete(username);
		LOG.info(`User '${username}' has been logged out and session removed`);
	};

	// [2-5]: Additional helper methods for debugging and management
	getActiveUsers() {
		return Array.from(this.sessions.keys());
	};

	// [2-6]: Method to get all active sessions (for debugging purposes)
	getAllSessions() {
		return Array.from(this.sessions.values()).map(s => ({
			username: s.username,
			token: s.token.substring(0, 10) + '...', // Show only first 10 chars for security
			expiresAt: s.expiresAt
		}));
	};

	// [2-7]: Method to check if a user has an active session
	validateUser(username) {
		const isActive = this.sessions.has(username);
		LOG.debug(`Checking active session for user '${username}': ${isActive}`);
		return isActive;
	};
};

// [3]: Export an instance of the TokenManager to be used across the application
module.exports = new TokenManager();
