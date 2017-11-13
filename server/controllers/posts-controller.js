'use strict'

const express = require('express');
const router = express.Router();
const passport = require('passport');
const controllerHelper = require('./controller-helper');

const Post = require('../models/post');
const Group = require('../models/group');
const GroupUser = require('../models/group-user');
const knex = require('../../db/knex');

// Retrieve all posts belonging to the user's groups
router.get('/', passport.authenticate('jwt', { session: false }), controllerHelper.wrapAsync(async function(req, res) {
  const posts = await Group.query((qb) => {
    qb.select('id', 'name', 'is_just_me')
      .where(knex.raw(`id IN (SELECT group_id FROM groups_users WHERE user_id=${req.user.id})`))
  }).fetchAll({ withRelated: 'posts' });

  res.json(posts);
}));

router.get('/:id', passport.authenticate('jwt', { session: false }), controllerHelper.wrapAsync(async function(req, res) {
  const post = await Post.where( 'id', req.params.id).fetch();
  if (post && post.attributes.user_id === req.user.id) {
    return res.status(200).json(post);
  }
  return res.status(401).send('Unauthorized');
}));

// TODO: Input validation?
// Insert new post related to authenticated user
router.post('/', passport.authenticate('jwt', { session: false }), controllerHelper.wrapAsync(async function(req, res) {
  const groupUser = await GroupUser.where({ user_id: req.user.id, group_id: req.body.group_id }).fetch();
  // User is not in group indicated in body
  if (!groupUser) {
    return res.status(401).send('Unauthorized');
  }
  // TODO: Default group_id to that of the user's permanent solo group
  // TODO: validate user input here? Or at least on the model, really
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
}));

module.exports = router;