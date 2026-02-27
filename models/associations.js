"use strict";

// Export initialized Sequelize models from src/models/index.js
const db = require('./index');

const { User, Produce, Order, OrderItem, Notification } = db;

module.exports = {
	User,
	Produce,
	Order,
	OrderItem,
	Notification,
	sequelize: db.sequelize,
	Sequelize: db.Sequelize,
};