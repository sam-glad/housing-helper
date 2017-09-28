const Post = require('../models').Post;

module.exports = {
  create(req, res) {
    return Post.create({
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
    })
    .then(post => res.status(201).send(post))
    .catch(error => res.status(400).send(error));
  },

  list(req, res) {
    return Post.all()
    .then(posts => res.status(200).send(posts))
    .catch(error => res.status(400).send(error));
  }
};