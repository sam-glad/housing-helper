'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jwt-simple');
const User = require('../models/user');
const authConfig = require('../config/auth-config');
const Promise = require('bluebird');

router.post('/login', (req, res) => {
  Promise.coroutine(function* () {
    const user = yield User.where('email_address', req.body.emailAddress).fetch();
    const isValidPassword = yield user.validPassword(req.body.password);
    if (isValidPassword) {
      const token = jwt.encode(user.omit('password'), authConfig.jwtSecret);
      res.json({success: true, token: `JWT ${token}`});
    } else {
      res.json({success: false, msg: 'Authentication failed'});
    }
  })().catch(err => console.log(err));
});

// TODO: catch sql errors
router.post('/register', async (req, res) => {
  const userFromRequest = { 
    email_address: req.body.emailAddress,
    name_first: req.body.nameFirst,
    name_last: req.body.nameLast,
    password: req.body.password
  };
  const user = await User.forge(userFromRequest).save();
  res.json(user.omit('password'));
});

module.exports = router;