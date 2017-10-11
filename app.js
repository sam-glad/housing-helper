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

module.exports = app;