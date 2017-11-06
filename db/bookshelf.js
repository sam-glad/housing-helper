const knex = require('./knex');
const bookshelf = require('bookshelf')(knex);

// Resolve circular dependencies with relations (thank god)
bookshelf.plugin('registry');
// Make transactions less headache-inducing to read/write
bookshelf.plugin(require('bookshelf-cls-transaction'));

module.exports = bookshelf;