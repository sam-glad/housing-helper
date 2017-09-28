'use strict';
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    title: DataTypes.STRING,
    body: DataTypes.TEXT,
    price: DataTypes.INTEGER,
    address: DataTypes.STRING,
    bedrooms: DataTypes.INTEGER,
    bathrooms: DataTypes.INTEGER,
    square_footage: DataTypes.INTEGER,
    parking: DataTypes.STRING,
    housingtype: DataTypes.STRING,
    url: DataTypes.STRING,
    craigslist_post_id: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: (models) => {
        // associations can be defined here
      }
    }
  });
  return Post;
};