'use strict'

const express = require('express');
const router = express.Router();
const passport = require('passport');
const controllerHelper = require('./helpers/controller-helper');
const knex = require('../../db/knex');

const User = require('../models/user');

router.get('/search', passport.authenticate('jwt', { session: false }), controllerHelper.wrapAsync(async function(req, res) {
  if (!req.query || (!req.query.name && !req.query.emailAddress)) {
    res.status(400).send('Neither email address nor name provided'); // TODO constants file for this
  }

  let users;
  if (req.query.emailAddress) {
    // TODO: Case insensitive
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
}));

router.delete('/', passport.authenticate('jwt', { session: false }), controllerHelper.wrapAsync(async function(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.body.emailAddress && req.body.emailAddress.toLowerCase() === req.user.attributes.email_address.toLowerCase() && req.body.confirmDelete === true) {
    await req.user.destroy();
    return res.status(204).json({ deleted: true });
  // TODO: This else makes me nervous - come back to it?
  } else {
    return res.status(400).json( { message: 'Ensure that the value of email_address is your email address and that the value of confirmDelete is true' } )
  }
}));

module.exports = router;