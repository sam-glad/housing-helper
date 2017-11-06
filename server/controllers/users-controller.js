'use strict'

const express = require('express');
const router = express.Router();
const passport = require('passport');
const knex = require('../../db/knex');
const Bookshelf = require('../../db/bookshelf');

const User = require('../models/user');

router.get('/search', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (!req.query || (!req.query.name && !req.query.emailAddress)) {
      res.status(400).send('Neither email address nor name provided'); // TODO constants file for this
    }

    let users;
    if (req.query.emailAddress) {
      users = await User.where('email_address', req.query.emailAddress).fetchAll();
    } else if (req.query.name) {
      const nameForQuery = req.query.name.toLowerCase();
      users = await User.query((qb) => {
        qb.select('id', 'name_first', 'name_last', 'name_full')
          .where(
          // See "add-lower-name-full-index-to-users" migration,
          // inspired by: https://stackoverflow.com/questions/1566717/postgresql-like-query-performance-variations
          knex.raw('LOWER("name_full") LIKE ?', `%${nameForQuery}%`)
        );
      }).fetchAll();
    }
    res.json(users);
  }
  catch(error) {
    console.log(error);
    res.status(400).send();
  }
});

module.exports = router;