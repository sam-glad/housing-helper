'use strict';

const express = require('express');
const jwt = require('jwt-simple');
const User = require('../models/user');
const authConfig = require('../config/auth-config');

async function login(req, res) {
  const {username, password} = req.body;
  try {
    const user = await User.where('username', username).fetch();
    if (user) {
      const isValidPassword = await user.validPassword(password);
      if (isValidPassword) {
        const token = jwt.encode(user.omit('password'), authConfig.jwtSecret);
        return res.json({success: true, token: `JWT ${token}`});
      }
    }
    res.status(401).json({success: false, msg: 'Authentication failed'});
  }
  catch(error) {
    // TODO: Something more permanent - Middleware?!
    console.log(error);
    res.status(500).json({ success: false, msg: 'Uh oh, something went wrong' });
  }
};

async function register(req, res) {
  const { username, password } = req.body;
  try {
    const user = await User.forge({username, password}).save();
    res.json(user.omit('password'));
  }
  catch(error) {
    // TODO: Something more permanent - Middleware?!
    console.log(error);
    res.status(500).json({ success: false, msg: 'Uh oh, something went wrong' });
  }
};

module.exports = { 
  login,
  register
};