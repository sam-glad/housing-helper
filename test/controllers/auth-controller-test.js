const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
const should = chai.should();

const User = require('../../server/models/user');

const userHelper = require('../helpers/user-helper');
const groupHelper = require('../helpers/group-helper');

chai.use(chaiHttp);

describe('Auth', () => {
    beforeEach(async () => {
      await userHelper.deleteAllUsers();
      await groupHelper.deleteAllGroups();
    });
  describe('POST /auth/register', () => {
      it('should register a new user with valid credentials', (done) => {
        const user = userHelper.buildUser();
        chai.request(server)
            .post('/api/auth/register')
            .send(user)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.name_first.should.equal(user.name_first);
              res.body.name_last.should.equal(user.name_last);
              res.body.email_address.should.equal(user.email_address);
              res.body.id.should.be.a('number');
              done();
            });
      });

      it('should not register a new user with invalid credentials', (done) => {
        const invalidUser = {};
        chai.request(server)
            .post('/api/auth/register')
            .send(invalidUser)
            .end((err, res) => {
              res.should.have.status(400);
              done();
            });
      });
  });

  describe('POST /auth/login', () => {
    it('should allow an existing user with valid credentials to log in', async () => {
      const user = userHelper.buildUser()
      await User.forge(user).save();      
      const body = {
        email_address: user.email_address,
        password: user.password
      };

      const res = await chai.request(server)
        .post('/api/auth/login')
        .send(body);

        res.should.have.status(200);
        res.body.token.should.be.a('string');
    });

    it('should not return a token for a request with invalid credentials', async () => {
      const invalidUser = {
        email_address: 'test@example.com',
        password: 'WROOOONG!'
      };

      // try-catch due to superagent being a presumptious putz:
      // https://github.com/chaijs/chai-http/issues/75
      try {
        const res = await chai.request(server)
        .post('/api/auth/login')
        .send(invalidUser);
      } catch(res) {
        res.should.have.status(401);
      }
    }); // it...
  });
});