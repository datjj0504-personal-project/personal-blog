module.exports = (sequelize, Sequelize) => {
	const TbManageTokenRealtime = sequelize.define(
		"tb_manage_token_realtime",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			username: {
				type: Sequelize.STRING(50),
				allowNull: false,
				unique: true,
			},
			token: {
				type: Sequelize.STRING(512),
				allowNull: false,
			},
			expires_at: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			remaining_seconds: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
		},
		{
			tableName: "tb_manage_token_realtime",
			timestamps: true,
			underscored: true,
		}
	);

	return TbManageTokenRealtime;
};
