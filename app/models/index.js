const dbConfig      = require("../configs/db.config");
const { Sequelize } = require("sequelize");

// Create connection Sequelize
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
	host: dbConfig.HOST,
	port: dbConfig.PORT,
	dialect: dbConfig.dialect,
	pool: dbConfig.pool,
	logging: false,
});

// Import model User
const UserModel = require("./user.model");
const ListUsers = UserModel(sequelize, Sequelize);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.listUsers = ListUsers;

module.exports = db;