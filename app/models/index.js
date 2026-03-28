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
const InfoLoginModel = require("./infoLogin.model");
const InfoLogoutModel = require("./infoLogout.model");
const TbInfoLogin = InfoLoginModel(sequelize, Sequelize);
const TbInfoLogout = InfoLogoutModel(sequelize, Sequelize);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.listUsers = ListUsers;
db.tbInfoLogin = TbInfoLogin;
db.tbInfoLogout = TbInfoLogout;

module.exports = db;
