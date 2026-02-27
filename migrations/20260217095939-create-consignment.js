'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Consignments', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
      },
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {model: 'Orders', key: 'id'},
        onDelete: 'CASCADE'
      },
      driver_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {model: 'Users', key: 'id'},
        onDelete: 'CASCADE'
      },
      status: {
        type: DataTypes.ENUM('pending', 'in-transit', 'delivered'),
        defaultValue: 'pending'
      },
      pickup_location: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      delivery_location: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      estimated_delivery: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      paymentMethod: {
        type: DataTypes.ENUM('Mobile Money', 'Bank', 'Cash'),
        allowNull: false
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
    await queryInterface.dropTable('Transactions');
  }
};