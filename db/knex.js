let environment = process.env.NODE_ENV || 'development';
let config = require('../knexfile.js')[environment];

module.exports = require('knex')(config);