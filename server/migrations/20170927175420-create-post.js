'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      body: {
        type: Sequelize.TEXT
      },
      price: {
        type: Sequelize.INTEGER
      },
      address: {
        type: Sequelize.STRING
      },
      bedrooms: {
        type: Sequelize.INTEGER
      },
      bathrooms: {
        type: Sequelize.INTEGER
      },
      square_footage: {
        type: Sequelize.INTEGER
      },
      parking: {
        type: Sequelize.STRING
      },
      housingtype: {
        type: Sequelize.STRING
      },
      url: {
        type: Sequelize.STRING
      },
      craigslist_post_id: {
        type: Sequelize.INTEGER
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
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Posts');
  }
};