'use strict';
const Bookshelf = require('../../db/bookshelf');

const Post = Bookshelf.Model.extend({
  tableName: 'posts',
  hasTimestamps: true
});

module.exports = Bookshelf.model('Post', Post);