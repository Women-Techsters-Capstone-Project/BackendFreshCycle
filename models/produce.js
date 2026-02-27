'use strict';

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Produce extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Produce.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    quantity: DataTypes.FLOAT,
    price_per_kg: DataTypes.DECIMAL(10, 2),
    category: DataTypes.ENUM('vegetable', 'fruit', 'grain', 'nuts&legumes', 'dairy', 'meat', 'other'),
    location: DataTypes.GEOMETRY('POINT'),
    status: {
      type: DataTypes.STRING,
      defaultValue: 'available'
    },
    grade: DataTypes.ENUM('A', 'B', 'C'),
    harvest_date: DataTypes.DATEONLY,
    farmer_id: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Produce',
  });
  return Produce;
};