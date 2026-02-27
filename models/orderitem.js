'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  OrderItem.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    produce_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    quantity: DataTypes.FLOAT,
    price_at_purchase: DataTypes.DECIMAL(10, 2) // Captured at time of purchase
  }, {
    sequelize,
    modelName: 'OrderItem',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return OrderItem;
};