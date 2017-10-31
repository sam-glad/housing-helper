process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
const should = chai.should();
const expect = chai.expect;

const User = require('../../server/models/user');
const GroupUser = require('../../server/models/group-user');
const Group = require('../../server/models/group');

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
              expect(res.body.name_first).to.equal(user.name_first);
              expect(res.body.name_last).to.equal(user.name_last);
              expect(res.body.email_address).to.equal(user.email_address);
              expect(res.body.id).to.be.a('number');
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
        expect(res.body.token).to.be.a('string');
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