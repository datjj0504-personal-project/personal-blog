const Joi = require("joi");
const db = require("../models");
const createLogger = require("../utilities/logger");

const LOG = createLogger("COMMENTS CTLR");

const createCommentSchema = Joi.object({
	post_id: Joi.number().integer().positive().required().messages({
		"number.base": "post_id must be a number",
		"number.integer": "post_id must be an integer",
		"number.positive": "post_id must be greater than 0",
		"any.required": "post_id is required",
	}),
	content: Joi.string().trim().min(1).max(1000).required().messages({
		"string.empty": "Content is required",
		"string.min": "Content must be at least 1 character",
		"string.max": "Content must be at most 1000 characters",
		"any.required": "Content is required",
	}),
});

module.exports = {
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

			const user = await db.listUsers.findOne({
				where: { username },
				attributes: ["user_id"],
			});
			if (!user) {
				LOG.warn("Create comment attempted with unknown user:", username);
				return res.status(401).json({ status: false, message: "Unauthorized" });
			}

			const post = await db.posts.findByPk(value.post_id, { attributes: ["id"] });
			if (!post) {
				LOG.warn("Create comment attempted for missing post:", value.post_id);
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
};
