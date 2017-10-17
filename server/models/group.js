'use strict';
const Bookshelf = require('../../db/bookshelf');
require('./user');

function users() {
  return this.belongsToMany('User');
}

async function retrieveWithUsers(groupId) {
  return await this.where('id', groupId).fetch({
    withRelated: [{'users': function(qb) {
      // Don't send the users' passwords :)
      qb.column('users.id', 'username');
    }}]
  });
}

function hasUser(groupWithUsers, authenticatedUserId) {
  return groupWithUsers.related('users').filter(user => user.id === authenticatedUserId);  
}

const Group = Bookshelf.Model.extend({
  tableName: 'groups',
  hasTimestamps: true,
  users,
  retrieveWithUsers,
  hasUser
});

module.exports = Bookshelf.model('Group', Group);