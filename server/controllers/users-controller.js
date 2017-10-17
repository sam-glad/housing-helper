'use strict'

const express = require('express');
const router = express.Router();
const passport = require('passport');

const User = require('../models/user');

router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    let users;
    if (req.query.emailAddress) {
      users = await User.where('email_address', req.query.emailAddress).fetchAll();
    } else if (req.query.name) {
      users = await User.query((qb) => {
        qb.where('name_full', 'LIKE', `%${req.query.name}%`);
      }).fetchAll();
    }
    res.json(users);
  }
  catch(error) {
    console.log(error);
    res.status(400);
  }
});

module.exports = router;