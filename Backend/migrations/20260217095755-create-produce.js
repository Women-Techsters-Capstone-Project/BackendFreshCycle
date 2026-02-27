'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Produces', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
      },
      category: {
        type: DataTypes.ENUM('vegetable', 'fruit', 'grain', 'nuts&legumes', 'dairy', 'meat', 'other'),
        allowNull: false
      },
      quantity: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      grade: {
        type: DataTypes.ENUM('A', 'B', 'C'),
        defaultValue: 'B'
      },
      price_per_kg: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('available', 'pending', 'sold', 'delivered'),
        defaultValue: 'available'
      },
      location: {
        type: DataTypes.GEOMETRY('POINT'),
        allowNull: false
      },
      harvest_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      farmer_id: {
        type: DataTypes.UUID,
        allowNull:false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Produces');
  }
};