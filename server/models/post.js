'use strict';
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    title: DataTypes.STRING,
    body: DataTypes.TEXT,
    price: DataTypes.INTEGER,
    address: DataTypes.STRING,
    bedrooms: DataTypes.INTEGER,
    bathrooms: DataTypes.INTEGER,
    squareFootage: DataTypes.INTEGER,
    parking: DataTypes.STRING,
    housingType: DataTypes.STRING,
    url: DataTypes.STRING,
    craigslistPostId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: (models) => {
        // associations can be defined here
      }
    }
  });
  return Post;
};