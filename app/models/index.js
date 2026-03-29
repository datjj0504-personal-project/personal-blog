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
const PostsModel = require("./posts.model");
const Posts = PostsModel(sequelize, Sequelize);
const PostLikesModel = require("./postLike.model");
const PostLikes = PostLikesModel(sequelize, Sequelize);
const CommentsModel = require("./comments.model");
const Comments = CommentsModel(sequelize, Sequelize);
const InfoLoginModel = require("./infoLogin.model");
const InfoLogoutModel = require("./infoLogout.model");
const TbManageTokenRealtimeModel = require("./tb_manage_token_realtime.model");
const TbInfoLogin = InfoLoginModel(sequelize, Sequelize);
const TbInfoLogout = InfoLogoutModel(sequelize, Sequelize);
const TbManageTokenRealtime = TbManageTokenRealtimeModel(sequelize, Sequelize);

// Relations
ListUsers.hasMany(Posts, { foreignKey: "user_id" });
Posts.belongsTo(ListUsers, { foreignKey: "user_id" });
Posts.hasMany(Comments, { foreignKey: "post_id" });
Comments.belongsTo(Posts, { foreignKey: "post_id" });
ListUsers.hasMany(Comments, { foreignKey: "user_id" });
Comments.belongsTo(ListUsers, { foreignKey: "user_id" });
ListUsers.belongsToMany(Posts, { through: PostLikes, foreignKey: "user_id", otherKey: "post_id" });
Posts.belongsToMany(ListUsers, { through: PostLikes, foreignKey: "post_id", otherKey: "user_id" });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.listUsers = ListUsers;
db.posts = Posts;
db.postLikes = PostLikes;
db.comments = Comments;
db.tbInfoLogin = TbInfoLogin;
db.tbInfoLogout = TbInfoLogout;
db.tbManageTokenRealtime = TbManageTokenRealtime;

module.exports = db;
