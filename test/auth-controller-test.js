process.env.NODE_ENV = 'test';

// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');
const should = chai.should();
const expect = chai.expect;

const User = require('../server/models/user');
const GroupUser = require('../server/models/group-user');
const Group = require('../server/models/group');

chai.use(chaiHttp);

// async function createValidUser() {
//   const user = {
//                  name_first: 'First name',
//                  name_last: 'Last name',
//                  name_full: 'First name Last name', // TODO: Automate this... good lord
//                  email_address: 'test@example.com',
//                  password: 'pass'
//                };
//   return await User.forge(user).save(user);
// }

describe('Auth', () => {
    beforeEach(async () => {
      await User.where('id', '!=', '0').destroy();
      await Group.where('id', '!=', '0').destroy();
    });
  describe('POST /auth/register', () => {
      it('should register a new user with valid credentials', (done) => {
        const user = {
                       name_first: 'First name', 
                       name_last: 'Last name', 
                       email_address: 'test@example.com',
                       password: 'pass'
                     };
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
      const user = {
                 name_first: 'First name',
                 name_last: 'Last name',
                 name_full: 'First name Last name', // TODO: Automate this... good lord
                 email_address: 'test@example.com',
                 password: 'pass'
               };
      await User.forge(user).save();      
      const body = {
        email_address: user.email_address,
        password: user.password
      };

      chai.request(server)
        .post('/api/auth/login')
        .send(body)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.token).to.be.a('string');
        });
    });

    it('should not return a token for a request with invalid credentials', (done) => {
      const invalidUser = {
        email_address: 'test@example.com',
        password: 'WROOOONG!'
      };
      chai.request(server)
      .post('/api/auth/login')
      .send(invalidUser)
      .end((err, res) => {
        res.should.have.status(401);
        expect(res.body.token).to.not.exist;
        done();
      });
    });
  });

});