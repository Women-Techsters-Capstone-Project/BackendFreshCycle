'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
require('dotenv').config(); // <- Make sure this is at the very top
const basename = path.basename(__filename);
const db = {};

// Read DB config from .env
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // optional: disables SQL logging
  }
);

// Load all models in this directory
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file !== 'associations.js' &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Run model associations if defined
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
// Models were loaded from the files in this directory above. Ensure we use those
// model instances (db.User, db.Produce, etc.) instead of migration files.

db.User.hasMany(db.Produce, {
    foreignKey: 'farmer_id',
    onDelete: 'CASCADE',
})
db.Produce.belongsTo(db.User, {
    foreignKey: 'farmer_id',
})

db.User.hasMany(db.Order, {
    foreignKey: 'buyer_id',
    onDelete: 'CASCADE',
})
db.Order.belongsTo(db.User, {
    foreignKey: 'buyer_id',
})

db.Order.hasOne(db.Consignment, {
    foreignKey: 'order_id',
    onDelete: 'CASCADE',
})
db.Consignment.belongsTo(db.Order, {
    foreignKey: 'order_id',
})

db.Order.hasMany(db.OrderItem, {
    foreignKey: 'order_id',
    onDelete: 'CASCADE',
})
db.OrderItem.belongsTo(db.Order, {
    foreignKey: 'order_id',
})

db.Produce.hasMany(db.OrderItem, {
    foreignKey: 'produce_id',
    onDelete: 'CASCADE',
})
db.OrderItem.belongsTo(db.Produce, {
    foreignKey: 'produce_id',
})

db.Produce.hasMany(db.OrderItem);
db.OrderItem.belongsTo(db.Produce)

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
