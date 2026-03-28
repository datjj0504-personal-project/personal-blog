module.exports = (sequelize, Sequelize) => {
	const ListUsers = sequelize.define("ListUsers", {
		user_id: {
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
		password: {
			type: Sequelize.STRING(255),
			allowNull: false,
		},
		password_encode: {
			type: Sequelize.STRING(255),
			allowNull: false,
			defaultValue: '',
		},
	}, {
		indexes: [
			{
				unique: true,
				fields: ["user_id", "username"],
			},
		],
	});

	return ListUsers;
};
