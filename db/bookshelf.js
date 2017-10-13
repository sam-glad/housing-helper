const knex = require('./knex');
const bookshelf = require('bookshelf')(knex);

// Resolve circular dependencies with relations (thank god)
bookshelf.plugin('registry');

module.exports = bookshelf;