'use strict'

const express = require('express');
const router = express.Router();
const passport = require('passport');

const Post = require('../models/post');
const Group = require('../models/group');
const GroupUser = require('../models/group-user');
const knex = require('../../db/knex');

// TODO: catch sql errors
// Retrieve all posts belonging to the user's groups
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const posts = await Group.query((qb) => {
      qb.select('id', 'name', 'is_just_me')
        .where(knex.raw(`id IN (SELECT group_id FROM groups_users WHERE user_id=${req.user.id})`))
    }).fetchAll({ withRelated: 'posts' });

    res.json(posts);
  }
  catch(error) {
    console.log(error)
    res.status(400).send();
  }
});

router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const post = await Post.where( 'id', req.params.id).fetch();
    if (post && post.attributes.user_id === req.user.id) {
      return res.status(200).json(post);
    }
    return res.status(401).send('Unauthorized');
  }
  catch(error) {
    console.log(error);
    return res.status(400).send();
  }
});

// TODO: Input validation?
// Insert new post related to authenticated user
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const groupUser = await GroupUser.where({ user_id: req.user.id, group_id: req.body.group_id }).fetch();
  // User is not in group indicated in body
  if (!groupUser) {
    return res.status(401).send('Unauthorized');
  }

  try {
    // TODO: Default group_id to that of the user's permanent solo group
    const insertedPost = await Post.forge({
      title: req.body.title,
      price: req.body.price,
      address: req.body.address,
      bedrooms: req.body.bedrooms,
      bathrooms: req.body.bathrooms,
      square_footage: req.body.square_footage,
      parking: req.body.parking,
      housing_type: req.body.housing_type,
      url: req.body.url,
      craigslist_post_id: req.body.craigslist_post_id,
      user_id: req.user.id,
      group_id: req.body.group_id
    }).save();
    res.status(201).json(insertedPost.toJSON());
  }
  catch(error) {
    console.log(error);
    res.status(400).send();
  }
});

module.exports = router;