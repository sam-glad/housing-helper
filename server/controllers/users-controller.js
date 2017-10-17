'use strict'

const express = require('express');
const router = express.Router();
const passport = require('passport');

const User = require('../models/user');

router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    let user;
    if (req.query.username) {
      user = await User.where('username', req.query.username).fetch();
    }
    res.json(user);
  }
  catch(error) {
    console.log(error);
    res.json(400);
  }
});

module.exports = router;