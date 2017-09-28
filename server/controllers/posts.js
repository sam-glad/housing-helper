const Post = require('../models').Post;

async function list(req, res) {
  try {
    const posts = await Post.all();
    res.status(200).send(posts);
  }
  catch(error) {
    res.status(400).send(error);
  }
};

async function create(req, res) {
  try {
    const post = await Post.create({
      title: req.body.title,
      body: req.body.body,
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
    res.status(201).send(post);
  }
  catch(error) {
    res.status(400).send(error);
  }
};

module.exports = {
  create,
  list
};