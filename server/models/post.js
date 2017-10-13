'use strict';
const Bookshelf = require('../../db/bookshelf');
require('./user');

function user() {
  return this.belongsTo('User');
}

const Post = Bookshelf.Model.extend({
  tableName: 'posts',
  hasTimestamps: true,
  user
});

module.exports = Bookshelf.model('Post', Post);