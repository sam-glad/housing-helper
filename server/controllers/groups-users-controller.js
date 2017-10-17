'use strict'

const express = require('express');
const router = express.Router();
const passport = require('passport');

const GroupUser = require('../models/group-user');
const Group = require('../models/group');

router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const group = new Group();
    const groupWithUsers = await group.retrieveWithUsers(req.body.group_id);

    if (!group.hasUser(groupWithUsers, req.user.id)) {
      return res.status(401).json('Unauthorized');
    }

    const userIds = req.body.users.map(user => user.id);

    await groupWithUsers.users().attach(userIds);
    // TODO: Don't make the same goddamned query
    // Figure out how to return JSON of the updated group with users
    return res.json(await group.retrieveWithUsers(req.body.group_id));
  }
  catch(error) {
    console.log(error);
    res.status(400);
  }
});

module.exports = router;