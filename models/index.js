'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

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
