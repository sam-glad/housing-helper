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
    const group = new Group();
    const groupWithUsers = await group.retrieveWithUsers(req.params.id);

    if (!group.hasUser(groupWithUsers, req.user.id)) {
      return res.status(401).send('Unauthorized');
    }

    // We only needed the users for the check above, so we just return the group
    return res.json(groupWithUsers.omit('users'));
  }
  catch(error) {
    console.log(error)
    return res.status(400);
  }
});

// Get all users in a single group
router.get('/:id/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const group = new Group();
    const groupWithUsers = await group.retrieveWithUsers(req.params.id);

    if (!groupWithUsers || !groupWithUsers.hasUser(groupWithUsers, req.user.id)) {
      return res.status(401).send('Unauthorized');
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

// // TODO: Keep this? This feels sloppy re: REST conventions
// // Alternative right now is to POST /groups-users/
// router.patch('/:id/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
//   try {
//     const group = new Group();
//     const groupWithUsers = await group.retrieveWithUsers(req.params.id);

//     if (!group.hasUser(groupWithUsers, req.user.id)) {
//       return res.status(401).json('Unauthorized');
//     }

//     const userIds = req.body.users.map(user => user.id);

//     await groupWithUsers.users().attach(userIds);
//     // TODO: Don't make the same goddamned query
//     // Figure out how to return JSON of the updated group with users
//     return res.json(await group.retrieveWithUsers(req.params.id));
//   }
//   catch(error) {
//     console.log(error)
//     res.status(400);
//   }
// });

module.exports = router;