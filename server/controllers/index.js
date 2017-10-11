const express = require('express');
const router = express.Router();

const authController = require('./auth-controller');
const usersController = require('./users-controller');
const postsController = require('./posts-controller');

// TODO: clean up
router.use('/api/auth', authController);
router.use('/api/users', usersController);
router.use('/api/posts', postsController);

router.get('/', function(req, res) {
  res.send('Home page');
})

module.exports = router;