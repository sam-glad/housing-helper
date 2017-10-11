'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jwt-simple');
const User = require('../models/user');
const authConfig = require('../config/auth-config');
const Promise = require('bluebird');

router.post('/login', (req, res) => {
  const {username, password} = req.body;
  Promise.coroutine(function* () {
    const user = yield User.where('username', username).fetch();
    const isValidPassword = yield user.validPassword(password);
    if (isValidPassword) {
      const token = jwt.encode(user.omit('password'), authConfig.jwtSecret);
      res.json({success: true, token: `JWT ${token}`});
    } else {
      res.json({success: false, msg: 'Authentication failed'});
    }
  })().catch(err => console.log(err));
});

// TODO: catch sql errors
router.post('/register', (req, res) => {
  const {username, password} = req.body;
  User.forge({username, password}).save()
      .then(user => res.json(user.omit('password')));
});

module.exports = router;