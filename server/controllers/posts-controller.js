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
    res.status(400).send(error);
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
      user_id: req.user.id
    });
    res.status(201).json(insertedPost.toJSON());
  }
  // TODO: Don't actually send the error
  catch(error) {
    console.log(error);
    res.status(400).send(error);
  }
});

module.exports = router;