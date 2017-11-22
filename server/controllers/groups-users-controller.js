'use strict'

const express = require('express');
const router = express.Router();
const passport = require('passport');

const GroupUser = require('../models/group-user');
const Group = require('../models/group');
const Post = require('../models/post');

router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const group = new Group();
    const groupWithUsers = await group.retrieveWithUsers(req.body.group_id);

    if (!group.hasUser(groupWithUsers, req.user.id)) {
      return res.status(401).send();
    }

    const userIds = req.body.users.map(user => user.id);

    await groupWithUsers.users().attach(userIds);
    // TODO: Don't make the same goddamned query
    // Figure out how to return JSON of the updated group with users
    return res.json(await group.retrieveWithUsers(req.body.group_id));
  }
  catch(error) {
    console.log(error);
    res.status(400).send();
  }
});

router.delete('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const group = new Group();
    const groupWithUsers = await group.retrieveWithUsers(req.body.group_id);
    const groupUser = await GroupUser.where({ group_id: req.body.group_id, user_id: req.user.id }).fetch();
    let responseBody;

    if (!groupWithUsers.attributes.is_just_me) {
      await groupUser.destroy();
      responseBody = { 
        membershipDeleted: true,
        groupDeleted: false,
        groupPostsDeleted: true
      };

      // Destroy group if authenticated user is the only one
      if (groupWithUsers.related('users').length === 1 && groupWithUsers.related('users').models[0].id === req.user.id) {
        await Post.where('group_id', req.body.group_id).destroy();
        responseBody.groupPostsDeleted = true;
        await groupWithUsers.destroy();
        responseBody.groupDeleted = true;
        res.status(204).json(responseBody);
      }
    } else {
      // User has tried to remove himself from permanent solo ("Just Me") group
      return res.status(400).send();
    }

    // FIXME
    return res.status(204).json(responseBody);
  }
  catch(error) {
    console.log(error)
    res.status(400).send();
  }
});

module.exports = router;