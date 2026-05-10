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

const createCommentSchema = Joi.object({
	post_id: Joi.number().integer().positive().required().messages({
		"number.base": "post_id must be a number",
		"number.integer": "post_id must be an integer",
		"number.positive": "post_id must be greater than 0",
		"any.required": "post_id is required",
	}),
	content: Joi.string()
		.trim()
		.min(1)
		.max(1000)
		.required()
		.messages({
			"string.empty": "Content is required",
			"string.min": "Content must be at least 1 character",
			"string.max": "Content must be at most 1000 characters",
			"any.required": "Content is required",
		}),
});

const updatePostSchema = Joi.object({
	post_id: Joi.number().integer().positive().required().messages({
		"number.base": "post_id must be a number",
		"number.integer": "post_id must be an integer",
		"number.positive": "post_id must be greater than 0",
		"any.required": "post_id is required",
	}),
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

const deletePostSchema = Joi.object({
	post_id: Joi.number().integer().positive().required().messages({
		"number.base": "post_id must be a number",
		"number.integer": "post_id must be an integer",
		"number.positive": "post_id must be greater than 0",
		"any.required": "post_id is required",
	}),
});

const findAuthenticatedUser = async (username) => {
	if (!username) {
		return null;
	}

	return db.listUsers.findOne({
		where: { username },
		attributes: ["user_id"],
	});
};


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
			const user = await findAuthenticatedUser(username);
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

	// ============================
	// Create comment
	// ============================
	createComment: async (req, res) => {
		LOG.debug("Create comment endpoint hit");
		try {
			const { error, value } = createCommentSchema.validate(req.body || {});
			if (error) {
				LOG.warn("Validation error during create comment:", error.details[0].message);
				return res.status(422).json({ status: false, message: error.details[0].message });
			}

			const username = req.user?.username;
			if (!username) {
				LOG.warn("Create comment attempted without authenticated user");
				return res.status(401).json({ status: false, message: "Unauthorized" });
			}

			const user = await findAuthenticatedUser(username);
			if (!user) {
				LOG.warn("Create comment attempted with unknown user:", username);
				return res.status(401).json({ status: false, message: "Unauthorized" });
			}

			const post = await db.posts.findByPk(value.post_id, { attributes: ["id"] });
			if (!post) {
				return res.status(404).json({ status: false, message: "Post not found" });
			}

			const result = await db.sequelize.transaction(async (transaction) => {
				const newComment = await db.comments.create(
					{
						post_id: value.post_id,
						user_id: user.user_id,
						content: value.content,
					},
					{ transaction }
				);

				return {
					id: newComment.id,
					post_id: newComment.post_id,
					content: newComment.content,
					created_at: newComment.created_at,
				};
			});

			return res.status(201).json({
				status: true,
				id: result.id,
				post_id: result.post_id,
				content: result.content,
				created_at: result.created_at,
			});
		} catch (error) {
			LOG.error("Create comment error:", { message: error?.message, stack: error?.stack });
			return res.status(500).json({ status: false, message: "Internal server error" });
		}
	},

	// ============================
	// Update personal post
	// ============================
	updatePost: async (req, res) => {
		LOG.debug("Update post endpoint hit");
		try {
			const { error, value } = updatePostSchema.validate(req.body || {});
			if (error) {
				LOG.warn("Validation error during update post:", error.details[0].message);
				return res.status(422).json({ status: false, message: error.details[0].message });
			}

			const username = req.user?.username;
			if (!username) {
				return res.status(401).json({ status: false, message: "Unauthorized" });
			}

			const user = await findAuthenticatedUser(username);
			if (!user) {
				return res.status(401).json({ status: false, message: "Unauthorized" });
			}

			const post = await db.posts.findOne({
				where: {
					id: value.post_id,
					user_id: user.user_id,
				},
			});
			if (!post) {
				return res.status(404).json({ status: false, message: "Post not found" });
			}

			const result = await db.sequelize.transaction(async (transaction) => {
				await post.update(
					{ content: value.content },
					{ transaction }
				);

				return {
					id: post.id,
					content: post.content,
					updated_at: post.updatedAt,
				};
			});

			return res.status(200).json({
				status: true,
				id: result.id,
				content: result.content,
				updated_at: result.updated_at,
			});
		} catch (error) {
			LOG.error("Update post error:", { message: error?.message, stack: error?.stack });
			return res.status(500).json({ status: false, message: "Internal server error" });
		}
	},

	// ============================
	// Delete personal post
	// ============================
	deletePost: async (req, res) => {
		LOG.debug("Delete post endpoint hit");
		try {
			const { error, value } = deletePostSchema.validate(req.body || {});
			if (error) {
				LOG.warn("Validation error during delete post:", error.details[0].message);
				return res.status(422).json({ status: false, message: error.details[0].message });
			}

			const username = req.user?.username;
			if (!username) {
				return res.status(401).json({ status: false, message: "Unauthorized" });
			}

			const user = await findAuthenticatedUser(username);
			if (!user) {
				return res.status(401).json({ status: false, message: "Unauthorized" });
			}

			const post = await db.posts.findOne({
				where: {
					id: value.post_id,
					user_id: user.user_id,
				},
				attributes: ["id"],
			});
			if (!post) {
				return res.status(404).json({ status: false, message: "Post not found" });
			}

			await db.sequelize.transaction(async (transaction) => {
				await db.comments.destroy({
					where: { post_id: value.post_id },
					transaction,
				});

				await db.postLikes.destroy({
					where: { post_id: value.post_id },
					transaction,
				});

				await db.posts.destroy({
					where: {
						id: value.post_id,
						user_id: user.user_id,
					},
					transaction,
				});
			});

			return res.status(200).json({
				status: true,
				post_id: value.post_id,
				message: "Post deleted successfully",
			});
		} catch (error) {
			LOG.error("Delete post error:", { message: error?.message, stack: error?.stack });
			return res.status(500).json({ status: false, message: "Internal server error" });
		}
	},

	// ============================
	// Toggle like / unlike
	// ============================
	toggleLike: async (req, res) => {
		LOG.debug("Toggle like endpoint hit");
		try {
			const postId = parseInt(req.query.post_id, 10);
			if (!postId || Number.isNaN(postId)) {
				return res.status(422).json({ status: false, message: "post_id is required" });
			}

			const username = req.user?.username;
			if (!username) {
				return res.status(401).json({ status: false, message: "Unauthorized" });
			}

			const user = await findAuthenticatedUser(username);
			if (!user) {
				return res.status(404).json({ status: false, message: "User not found" });
			}

			const post = await db.posts.findByPk(postId, { attributes: ["id"] });
			if (!post) {
				return res.status(404).json({ status: false, message: "Post not found" });
			}

			const result = await db.sequelize.transaction(async (transaction) => {
				const existing = await db.postLikes.findOne({
					where: { user_id: user.user_id, post_id: postId },
					transaction,
				});

				if (existing) {
					await db.postLikes.destroy({
						where: { user_id: user.user_id, post_id: postId },
						transaction,
					});
					return { liked: false };
				}

				await db.postLikes.create(
					{ user_id: user.user_id, post_id: postId },
					{ transaction }
				);

				return { liked: true };
			});

			return res.status(200).json({
				status: true,
				post_id: postId,
				liked: result.liked,
			});
		} catch (error) {
			LOG.error("Toggle like error:", { message: error?.message, stack: error?.stack });
			return res.status(500).json({ status: false, message: "Internal server error" });
		}
	},
};
