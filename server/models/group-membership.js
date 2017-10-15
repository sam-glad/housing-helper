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

const GroupMembership = Bookshelf.Model.extend({
  tableName: 'groups',
  hasTimestamps: true,
  group,
  user
});

module.exports = Bookshelf.model('GroupMembership', GroupMembership);