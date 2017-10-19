'use strict'

const express = require('express');
const router = express.Router();
const passport = require('passport');

const Post = require('../models/post');

// TODO: catch sql errors
// Retrieve all posts belonging to the user's groups
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const posts = await new GroupUser().where('user_id', req.user.id).fetchAll({ withRelated:('group.posts') });
    res.json(posts);
  }
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

    // TODO: Default group_id to that of the user's permanent solo group

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
  catch(error) {
    console.log(error);
    res.status(400);
  }
});

module.exports = router;