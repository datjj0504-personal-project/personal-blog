module.exports = (sequelize, Sequelize) => {
	const PostLikes = sequelize.define(
		"post_likes",
		{
			user_id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				allowNull: false,
			},
			post_id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				allowNull: false,
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW,
			},
		},
		{
			tableName: "post_likes",
			timestamps: false,
		}
	);

	return PostLikes;
};
