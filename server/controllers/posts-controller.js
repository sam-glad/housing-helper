'use strict'

const express = require('express');
const router = express.Router();
const passport = require('passport');

const Post = require('../models/post');
const User = require('../models/user');

// TODO: catch sql errors
// Retrieve all posts added by authenticated user
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const posts = await Post.where('user_id', req.user.id).fetchAll();
    res.json(posts);
  }
  // TODO: Don't actually send the error
  catch(error) {
    console.log(error)
    res.status(400);
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
    return res.status(400);
  }
});

// TODO: Input validation?
// Insert new post related to authenticated user
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    let post = new Post();

    const insertedPost = await post.save({
      title: req.body.title,
      price: req.body.price,
      address: req.body.address,
      bedrooms: req.body.bedrooms,
      bathrooms: req.body.bathrooms,
      squareFootage: req.body.squareFootage,
      parking: req.body.parking,
      housingType: req.body.housingType,
      url: req.body.url,
      craigslistPostId: req.body.craigslistPostId,
      user_id: req.user.id,
      group_id: req.body.groupId
    });
    res.status(201).json(insertedPost.toJSON());
  }
  // TODO: Don't actually send the error
  catch(error) {
    console.log(error);
    res.status(400);
  }
});

module.exports = router;