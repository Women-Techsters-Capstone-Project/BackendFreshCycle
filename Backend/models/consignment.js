'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Consignment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Consignment.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    type: DataTypes.STRING,
    order_id: DataTypes.UUID,
    driver_id: DataTypes.UUID,
    status: DataTypes.ENUM('pending', 'in-transit', 'delivered'),
    pickup_location: DataTypes.TEXT,
    delivery_location: DataTypes.TEXT,
    estimated_delivery: DataTypes.DATEONLY,
    amount: DataTypes.DECIMAL(12, 2),
    paymentMethod: DataTypes.ENUM('Mobile Money', 'Bank', 'Cash'),
  }, {
    sequelize,
    modelName: 'Consignment',
  });
  return Consignment;
};