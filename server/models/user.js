'use strict';

const bookshelf = require('../../db/bookshelf');
const Promise = require('bluebird');
const bcrypt = require('bcrypt');
const promisifiedBcrypt = Promise.promisifyAll(require('bcrypt'));
const authConfig = require('../config/auth-config');
require('./post');
require('./group');
require('./group-user');

function initialize() {
  this.on('saving', model => {
    if (!model.hasChanged('password')) return;

    return Promise.coroutine(function* () {
      const salt = yield promisifiedBcrypt.genSaltAsync(authConfig.saltRounds);
      const hashedPassword = yield promisifiedBcrypt.hashAsync(model.attributes.password, salt);
      model.set('password', hashedPassword);
    })();
  });
}

async function validPassword(password) {
  return await bcrypt.compare(password, this.attributes.password);
}

function posts() {
  return this.hasMany('Post');
}

function groups() {
  return this.belongsToMany('Group').through('GroupUser');
}

const User = bookshelf.Model.extend({
  tableName: 'users',
  validPassword,
  initialize,
  posts,
  groups
});

module.exports = bookshelf.model('User', User);