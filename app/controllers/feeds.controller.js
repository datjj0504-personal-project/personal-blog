// [###]: Feeds controller definition: Define controller functions for feeds resources

// [1]: Import necessary modules
const db = require("../models");
const createLogger = require("../utilities/logger");
const LOG = createLogger("FEEDS CTLR");

module.exports = {
	// ============================
	// Get feeds resources (latest posts)
	// ============================
	getResources: async (req, res) => {
		LOG.debug("Get feeds resources endpoint hit");
		try {
			const username = req.user?.username;
			if (!username) {
				return res.status(401).json({ status: false, message: "Unauthorized" });
			}

			const user = await db.listUsers.findOne({
				where: { username },
				attributes: ["user_id"],
			});
			if (!user) {
				return res.status(401).json({ status: false, message: "Unauthorized" });
			}

			const posts = await db.posts.findAll({
				attributes: {
					include: [
						[
							db.Sequelize.literal(
								`(SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = posts.id)`
							),
							"like_count",
						],
						[
							db.Sequelize.literal(
								`(SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id)`
							),
							"comment_count",
						],
						[
							db.Sequelize.literal(
								`(SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = posts.id AND post_likes.user_id = ${Number(
									user.user_id
								)})`
							),
							"is_liked",
						],
					],
				},
				include: [
					{
						model: db.listUsers,
						attributes: ["username"],
					},
					{
						model: db.comments,
						attributes: ["id", "post_id", "user_id", "content", "created_at"],
						separate: true,
						order: [["created_at", "DESC"]],
						include: [
							{
								model: db.listUsers,
								attributes: ["username"],
							},
						],
					},
				],
				order: [["created_at", "DESC"]],
			});

			const data = posts.map((post) => {
				const item = post.toJSON();
				item.author = item.ListUser?.username || null;
				item.is_liked = Number(item.is_liked) > 0;
				item.comments = (item.comments || []).map((comment) => ({
					id: comment.id,
					post_id: comment.post_id,
					user_id: comment.user_id,
					content: comment.content,
					created_at: comment.created_at,
					author: comment.ListUser?.username || null,
				}));
				delete item.ListUser;
				return item;
			});

			return res.status(200).json({
				status: true,
				data,
			});
		} catch (error) {
			LOG.error("Get feeds resources error:", { message: error?.message, stack: error?.stack });
			return res.status(500).json({
				status: false,
				message: "Internal server error",
			});
		}
	},
};
