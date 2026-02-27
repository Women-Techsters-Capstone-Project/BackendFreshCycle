'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Order.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    total_amount: DataTypes.DECIMAL(10, 2),
    // Keep compatibility with controllers using `total_price`
    total_price: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('total_amount');
      }
    },
    status: DataTypes.ENUM('pending', 'paid', 'dispatched', 'delivered','cancelled'),
    delivery_type: DataTypes.ENUM('self', 'logistics'),
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};