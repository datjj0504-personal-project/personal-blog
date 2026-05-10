module.exports = (sequelize, Sequelize) => {
	const TbInfoLogout = sequelize.define(
		"tb_info_logout",
		{
			time: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW,
			},
			user: {
				type: Sequelize.STRING(50),
				allowNull: false,
			},
			token: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
		},
		{
			tableName: "tb_info_logout",
			timestamps: false,
		}
	);

	return TbInfoLogout;
};
