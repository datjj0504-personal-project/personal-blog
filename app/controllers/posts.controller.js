// [###]: Posts controller definition: Define controller functions for creating posts

// [1]: Import necessary modules
const db = require("../models");
const Joi = require("joi");
const createLogger = require("../utilities/logger");
const LOG = createLogger("POSTS CTLR");

// [2]: Define validation schema
const createPostSchema = Joi.object({
	content: Joi.string()
		.trim()
		.min(1)
		.max(500)
		.required()
		.messages({
			"string.empty": "Content is required",
			"string.min": "Content must be at least 1 character",
			"string.max": "Content must be at most 500 characters",
			"any.required": "Content is required",
		}),
});

// [###]: Controller
module.exports = {
	// ============================
	// Create post
	// ============================
	createPost: async (req, res) => {
		LOG.debug("Create post endpoint hit");
		try {
			// [1]: Validate input
			const { error, value } = createPostSchema.validate(req.body || {});
			if (error) {
				LOG.warn("Validation error during create post:", error.details[0].message);
				return res.status(422).json({ status: false, message: error.details[0].message });
			}

			const username = req.user?.username;
			if (!username) {
				LOG.warn("Create post attempted without authenticated user");
				return res.status(401).json({ status: false, message: "Unauthorized" });
			}

			// [2]: Find user by username
			const user = await db.listUsers.findOne({
				where: { username },
				attributes: ["user_id"],
			});
			if (!user) {
				LOG.warn("Create post attempted with unknown user:", username);
				return res.status(401).json({ status: false, message: "Unauthorized" });
			}

			// [3]: Insert post using prepared statement to avoid SQL injection
			const { content } = value || {};
			const result = await db.sequelize.transaction(async (transaction) => {
				const newPost = await db.posts.create(
					{
						user_id: user.user_id,
						content,
					},
					{ transaction }
				);

				return {
					id: newPost.id,
					created_at: newPost.createdAt,
				};
			});

			// [4]: Return response
			return res.status(201).json({
				status: true,
				id: result.id,
				created_at: result.created_at,
			});
		} catch (error) {
			LOG.error("Create post error:", { message: error?.message, stack: error?.stack });
			return res.status(500).json({ status: false, message: "Internal server error" });
		}
	},
};
