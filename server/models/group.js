'use strict';
const Bookshelf = require('../../db/bookshelf');
require('./user');

function users() {
  return this.belongsToMany('User');
}

const Group = Bookshelf.Model.extend({
  tableName: 'groups',
  hasTimestamps: true,
  users
});

module.exports = Bookshelf.model('Group', Group);