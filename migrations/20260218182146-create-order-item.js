'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OrderItems', {
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
      produce_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {model: 'Produces', key: 'id'},
        onDelete: 'CASCADE'
      },    
      quantity: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      price_at_purchase: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('OrderItems');
  }
};