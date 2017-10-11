'use strict';

const bookshelf = require('../../db/bookshelf');
const Promise = require('bluebird');
const bcrypt = Promise.promisifyAll(require('bcrypt'));
const authConfig = require('../config/auth-config');

function initialize() {
  this.on('saving', model => {
    if (!model.hasChanged('password')) return;

    return Promise.coroutine(function* () {
      const salt = yield bcrypt.genSaltAsync(authConfig.saltRounds);
      const hashedPassword = yield bcrypt.hashAsync(model.attributes.password, salt);
      model.set('password', hashedPassword);
    })();
  });
}

function validPassword(password) {
  return bcrypt.compareAsync(password, this.attributes.password);
}

module.exports = bookshelf.Model.extend({
  tableName: 'users',
  validPassword,
  initialize
});