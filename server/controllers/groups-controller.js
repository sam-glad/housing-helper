'use strict'

const express = require('express');
const router = express.Router();
const passport = require('passport');

const Group = require('../models/group');
const User = require('../models/user');

// Get all of the authenticated user's groups
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.where('id', req.user.id).fetch({withRelated:'groups'});
    return res.json(user.related('groups'));
  }
  catch(error) {
    console.log(error)
    return res.status(400);
  }
});

// Retrieve one group
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const group = await retrieveGroupWithUsers(req.params.id);
    if (!authenticatedUserIsInGroup(groupWithUsers, req.user.id)) {
      return res.status(401).json('Unauthorized');
    }

    // We only needed the users for the check above, so we just return the group
    return res.json(group.omit('users'));
  }
  catch(error) {
    console.log(error)
    return res.status(400);
  }
});

router.get('/:id/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const groupWithUsers = await retrieveGroupWithUsers(req.params.id);
    if (!authenticatedUserIsInGroup(groupWithUsers, req.user.id)) {
      return res.status(401).json('Unauthorized');
    }

    return res.json(groupWithUsers);
  }
  catch(error) {
    console.log(error)
    res.status(400);
  }
});

// Create a new group
// TODO: user_id (as created_by)
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    console.log('Here we go');
    let group = new Group();

    const insertedGroup = await group.save({
      name: req.body.name
      // user_id: req.user.id
    });

    const user = await User.where('id', req.user.id).fetch();
    await insertedGroup.users().attach(user);
    res.status(201).json(insertedGroup.toJSON());
  }
  catch(error) {
    console.log(error);
    res.status(400);
  }
});

async function retrieveGroupWithUsers(groupId) {
  return await Group.where('id', groupId).fetch({
    withRelated: [{'users': function(qb) {
      // Don't send the users' passwords :)
      qb.column('users.id', 'username');
    }}]
  });
}

// groupWithUsers: fetched group with related users
function authenticatedUserIsInGroup(groupWithUsers, authenticatedUserId) {
  return groupWithUsers.related('users').filter(user => user.id === authenticatedUserId);  
}

module.exports = router;