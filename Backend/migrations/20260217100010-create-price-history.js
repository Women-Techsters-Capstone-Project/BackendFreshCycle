'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PriceHistories', {
      cropType: {
        allowNull: false,
        type: Sequelize.STRING
      },
      region: {
        type: Sequelize.STRING,
        allowNull: false
      },
      averagePrice: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      recordedAt: {
        type: Sequelize.DATE,
        defaultValue: DataTypes.NOW
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
    await queryInterface.dropTable('PriceHistories');
  }
};