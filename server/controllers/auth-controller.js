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
  const nameFirst = req.body.nameFirst.trim();
  const nameLast = req.body.nameLast.trim();
  const userFromRequest = { 
    email_address: req.body.emailAddress,
    name_first: nameFirst,
    name_last: nameLast,
    name_full: `${nameFirst} ${nameLast}`,
    password: req.body.password
  };
  const user = await User.forge(userFromRequest).save();
  res.json(user.omit('password'));
});

module.exports = router;