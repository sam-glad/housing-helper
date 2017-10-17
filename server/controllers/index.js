const express = require('express');
const router = express.Router();

const authController = require('./auth-controller');
const usersController = require('./users-controller');
const postsController = require('./posts-controller');
const groupsController = require('./groups-controller');
const groupsUsersController = require('./groups-users-controller');

router.use('/api/auth', authController);
router.use('/api/users', usersController);
router.use('/api/posts', postsController);
router.use('/api/groups', groupsController);
router.use('/api/groups-users', groupsUsersController);

router.get('/', function(req, res) {
  res.send('Home page');
})

module.exports = router;