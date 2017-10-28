'use strict';

const Bookshelf = require('../../db/bookshelf');
require('./user');
require('./post');
require('./group-user');

function users() {
  return this.belongsToMany('User').through('GroupUser');
}

function posts() {
  return this.hasMany('Post');
}

async function retrieveWithUsers(groupId) {
  return await this.where('id', groupId).fetch({
    withRelated: [{'users': function(qb) {
      // Don't send the users' passwords :)
      qb.column('users.id', 'name_first', 'name_last', 'name_full');
    }}]
  });
}

async function retrieveWithPosts(groupId, includeUsers) {
  if (!includeUsers) {
    return await this.where('id', groupId).fetch({ withRelated: 'posts' });
  }
  return await this.where('id', groupId).fetch({ withRelated: ['posts', 'users'] });
}

function hasUser(groupWithUsers, authenticatedUserId) {
  return groupWithUsers.related('users').filter(user => user.id === authenticatedUserId);  
}

const Group = Bookshelf.Model.extend({
  tableName: 'groups',
  hasTimestamps: true,
  users,
  posts,
  retrieveWithUsers,
  retrieveWithPosts,
  hasUser
});

module.exports = Bookshelf.model('Group', Group);