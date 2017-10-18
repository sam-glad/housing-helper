'use strict';

const Bookshelf = require('../../db/bookshelf');
require('./user');
require('./group');

function group() {
  return this.belongsTo('Group');
}

function user() {
  return this.belongsTo('User');
}

const GroupUser = Bookshelf.Model.extend({
  tableName: 'groups_users',
  hasTimestamps: true,
  group,
  user
});

module.exports = Bookshelf.model('GroupUser', GroupUser);