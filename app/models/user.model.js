module.exports = (sequelize, Sequelize) => {
	const ListUsers = sequelize.define("ListUsers", {
		username: {
			type: Sequelize.STRING(50),
			primaryKey: true,
			allowNull: false,
			unique: true,
		},
		password: {
			type: Sequelize.STRING(255),
			allowNull: false,
		},
	});

	return ListUsers;
};