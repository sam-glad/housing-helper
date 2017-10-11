'use strict';

const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const securityConfig = require('./auth-config');
const User = require('../models/user');

module.exports = function() {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = securityConfig.jwtSecret;
  passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    // TODO: Cleanup?
    User.where('id', jwt_payload.id).fetch()
      .then(user => user ? done(null, user) : done(null, false))
      .catch(err => done(err, false));
  }));
};