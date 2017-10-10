// const Post = require('../models').Post;
let PostModel = require('../models/post');
const knex = require('../../db/knex');

async function list(req, res) {
  try {
    let posts = new PostModel();
    const allPosts = await posts.fetchAll();
    res.json(allPosts.toJSON());
  }
  // TODO: Don't actually send the error
  catch(error) {
    res.status(400).send(error);
  }
};

async function create(req, res) {
  try {
    let post = new PostModel();
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
      craigslistPostId: req.body.craigslistPostId
    });
    console.log(insertedPost);
    res.status(201).json(insertedPost.toJSON());
    // res.json(post.toJSON());
  }
  // TODO: Don't actually send the error
  catch(error) {
    console.log(error);
    res.status(400).send(error);
  }
};

module.exports = {
  create,
  list
};