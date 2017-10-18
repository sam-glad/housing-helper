'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jwt-simple');
const authConfig = require('../config/auth-config');
const User = require('../models/user');
const Group = require('../models/group');
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
  // Add user's default group
  const soloGroup = await Group.forge({ name: 'Just Me' }).save();
  const retrievedGroup = await Group.where({ id:soloGroup.id }).fetch();
  retrievedGroup.users().attach(user.id);
  res.json(user.omit('password'));
});

module.exports = router;