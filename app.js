require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const configurePassport = require('./server/config/passport-jwt-config');

const app = express();
app.use(logger('dev'));
app.use(passport.initialize());
configurePassport();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require('./server/routes')(app);
app.get('*', (req, res) => res.status(200).send({
	message: 'TODO: Replace this placeholder text :)'
}));

module.exports = app;