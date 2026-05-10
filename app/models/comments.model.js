module.exports = (sequelize, Sequelize) => {
	const Comments = sequelize.define(
		"comments",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			post_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			user_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			content: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW,
			},
		},
		{
			tableName: "comments",
			timestamps: false,
		}
	);

	return Comments;
};
