const postsController = require('../controllers').posts;
const authController = require('../controllers/auth-controller');

module.exports = (app) => {
  app.post('/api/register', authController.register);
  app.post('/api/login', authController.login);
  app.post('/api/posts', postsController.create);
  app.get('/api/posts', postsController.list);
};