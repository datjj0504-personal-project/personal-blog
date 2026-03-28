module.exports = (sequelize, Sequelize) => {
	const Posts = sequelize.define(
		"posts",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
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
		},
		{
			tableName: "posts",
			timestamps: true,
			underscored: true,
		}
	);

	return Posts;
};
