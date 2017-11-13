require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const configurePassport = require('./server/config/passport-jwt-config');

const controllers = require('./server/controllers/index');

const app = express();
app.use(logger('dev'));
app.use(passport.initialize());
configurePassport();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(controllers);

// Global error-handling placeholder until I get something more flexible/elaborate in place
app.use((error, req, res, next) => {
  res.status(500).json({ message: 'Uh oh - something went wrong. Please make an issue at https://github.com/sam-glad/housing-helper' });
});

module.exports = app;