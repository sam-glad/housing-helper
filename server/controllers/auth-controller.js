'use strict';

const express = require('express');
const router = express.Router();
const controllerHelper = require('./controller-helper');
const jwt = require('jwt-simple');
const authConfig = require('../config/auth-config');
const User = require('../models/user');
const Group = require('../models/group');

router.post('/login', controllerHelper.wrapAsync(async function(req, res) {
  const user = await User.where('email_address', req.body.email_address).fetch();
  // No need to tell user making the request that the user in their payload exists with a 404
  if (!user) { return res.status(401).json({ message: 'Authentication failed' }); }
  const isValidPassword = await user.validPassword(req.body.password);
  if (isValidPassword) {
    const token = jwt.encode(user.omit('password'), authConfig.jwtSecret);
    res.json({success: true, token: `${token}`});
  } else {
    res.status(401).json({ message: 'Authentication failed' });
  }
}));

router.post('/register', controllerHelper.wrapAsync(async function(req, res) {
  const userFromRequest = { 
    email_address: req.body.email_address,
    name_first: req.body.name_first,
    name_last: req.body.name_last,
    password: req.body.password
  };

  // TODO: Model validation + middleware to handle this (stop being a meathead re: separation of concerns)
  Object.keys(userFromRequest).forEach((key) => {
    if (!userFromRequest[key]) {
      return res.status(400).json({ message: 'Ensure that email_address, name_first, name_last, and password all have values' });
    }
  });

  const user = await User.forge(userFromRequest).save();
  // Add user's default group
  const soloGroup = await Group.forge({ name: 'Just Me', is_just_me: true }).save();
  const retrievedGroup = await Group.where({ id: soloGroup.id }).fetch();
  retrievedGroup.users().attach(user.id);
  res.status(201).json(user.omit('password'));
}));

module.exports = router;