module.exports = (sequelize, Sequelize) => {
	const TbInfoLogin = sequelize.define(
		"tb_info_login",
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
			tableName: "tb_info_login",
			timestamps: false,
		}
	);

	return TbInfoLogin;
};
