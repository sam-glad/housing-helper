'use strict';
const Bookshelf = require('../../db/bookshelf');

const User = Bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true
});

module.exports = Bookshelf.model('User', User);