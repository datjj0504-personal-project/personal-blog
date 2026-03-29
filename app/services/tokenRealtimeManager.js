// [###]: Token Realtime Manager: sync active sessions to DB every 5 seconds

// [1]: Import necessary modules
const db = require("../models");
const tokenManager = require("./tokenManager");
const createLogger = require("../utilities/logger");
const LOG = createLogger("TOKEN REALTIME");

const INTERVAL_MS = 5000;

class TokenRealtimeManager {
	constructor() {
		this.intervalId = null;
	}

	// [2]: Start realtime sync
	start() {
		if (this.intervalId) {
			return;
		}
		this.intervalId = setInterval(() => {
			this.syncNow().catch((err) => {
				LOG.error("Realtime sync error:", { message: err?.message, stack: err?.stack });
			});
		}, INTERVAL_MS);
		LOG.info(`Realtime token sync started: every ${INTERVAL_MS}ms`);
	}

	// [3]: Stop realtime sync
	stop() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
			LOG.info("Realtime token sync stopped");
		}
	}

	// [4]: Sync sessions to DB
	async syncNow() {
		const sessions = tokenManager.getSessionsSnapshot();
		const nowMs = Date.now();

		if (sessions.length === 0) {
			await db.tbManageTokenRealtime.destroy({ where: {}, truncate: true });
			return;
		}

		const usernames = [];
		for (const s of sessions) {
			const remainingSeconds = Math.max(0, Math.ceil((s.expiresAt.getTime() - nowMs) / 1000));
			usernames.push(s.username);
			await db.tbManageTokenRealtime.upsert({
				username: s.username,
				token: s.token,
				expires_at: s.expiresAt,
				remaining_seconds: remainingSeconds,
			});
		}

		await db.tbManageTokenRealtime.destroy({
			where: {
				username: {
					[db.Sequelize.Op.notIn]: usernames,
				},
			},
		});
	}
}

module.exports = new TokenRealtimeManager();
