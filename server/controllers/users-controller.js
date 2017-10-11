'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/securedArea', passport.authenticate('jwt', { session: false }), (req, res) => {
  console.log(req.user.id);
  res.json({msg: "You made it to the secure area"});
});

module.exports = router;