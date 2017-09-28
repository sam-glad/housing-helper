'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Postings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull:false
      },
      body: {
        type: Sequelize.TEXT
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull:false
      },
      address: {
        type: Sequelize.STRING
      },
      bedrooms: {
        type: Sequelize.INTEGER,
        allowNull:false
      },
      bathrooms: {
        type: Sequelize.INTEGER
      },
      squareFootage: {
        type: Sequelize.INTEGER
      },
      parking: {
        type: Sequelize.STRING
      },
      housingType: {
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
    return queryInterface.dropTable('Postings');
  }
};