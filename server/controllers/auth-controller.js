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
    const user = yield User.where('email_address', req.body.email_address).fetch();
    const isValidPassword = yield user.validPassword(req.body.password);
    if (isValidPassword) {
      const token = jwt.encode(user.omit('password'), authConfig.jwtSecret);
      res.json({success: true, token: `${token}`});
    } else {
      res.status(401).json({success: false, msg: 'Authentication failed'});
    }
  })().catch(err => {
    console.log(err);
    res.status(401).send();
  });
});

// TODO: catch sql errors
router.post('/register', async (req, res) => {
  try {
    const userFromRequest = { 
      email_address: req.body.email_address,
      name_first: req.body.name_first,
      name_last: req.body.name_last,
      name_full: `${req.body.name_first} ${req.body.name_last}`,
      password: req.body.password
    };
    const user = await User.forge(userFromRequest).save();
    // Add user's default group
    const soloGroup = await Group.forge({ name: 'Just Me', is_just_me: true }).save();
    const retrievedGroup = await Group.where({ id: soloGroup.id }).fetch();
    retrievedGroup.users().attach(user.id);
    res.json(user.omit('password'));
  }
  catch(error) {
    // console.log(error);
    res.status(400).send();
  }
});

module.exports = router;