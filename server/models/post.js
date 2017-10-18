'use strict';

const Bookshelf = require('../../db/bookshelf');
require('./user');
require('./group');

// Created by
function user() {
  return this.belongsTo('User');
}

function group() {
  return this.belongsTo('Group');
}

const Post = Bookshelf.Model.extend({
  tableName: 'posts',
  hasTimestamps: true,
  user,
  group
});

module.exports = Bookshelf.model('Post', Post);