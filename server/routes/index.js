const postsController = require('../controllers').posts;

module.exports = (app) => {
  app.get('/api', (req, res) => res.status(200).send({
    message: 'Welcome to the Posts API!',
  }));

  app.post('/api/posts', postsController.create);
  app.get('/api/posts', postsController.list);
};