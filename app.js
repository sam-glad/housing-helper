require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const configurePassport = require('./server/config/passport-jwt-config');
const authController = require('./server/controllers/auth-controller');
const usersController = require('./server/controllers/users-controller');
const postsController = require('./server/controllers/posts-controller');

const app = express();
app.use(logger('dev'));
app.use(passport.initialize());
configurePassport();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// require('./server/routes')(app);
// app.get('*', (req, res) => res.status(200).send({
// 	message: 'TODO: Replace this placeholder text :)'
// }));

app.use('/api/auth', authController);
app.use('/api/users', usersController);
app.use('/api/posts', postsController);

module.exports = app;