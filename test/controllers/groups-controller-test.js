process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
const should = chai.should();

const User = require('../../server/models/user');
const GroupUser = require('../../server/models/group-user');
const Group = require('../../server/models/group');

const userHelper = require('../helpers/user-helper');
const groupHelper = require('../helpers/group-helper');

chai.use(chaiHttp);

describe('Groups', () => {

  beforeEach(async () => {
    await userHelper.deleteAllUsers();
    await groupHelper.deleteAllGroups();
  });

  describe('GET /groups/:id', () => {
    it('should return 401 when no user is authenticated', (done) => {
      chai.request(server)
        .get('/api/groups/1')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    }); // it should...

    it('should return 401 when the token passed is not valid', (done) => {
      chai.request(server)
        .get('/api/groups/1')
        .set('Authorization', 'This is not a token :)')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    }); // it should...

    it('should retrieve one group when the user is a member of it', async () => {
      const userToSave = userHelper.buildUser();
      const user = await User.forge(userToSave).save();
      const token = require('jwt-simple').encode(user.omit('password'), require('../../server/config/auth-config').jwtSecret);
      const firstGroup = await Group.forge({ name: 'Connected group' }).save();
      const attachment = await firstGroup.users().attach(user);
      const secondGroup = await Group.forge({ name: 'Unrelated group' }).save();

      const response = await chai.request(server)
        .get(`/api/groups/${firstGroup.id}`)
        .set('Authorization', `Bearer ${token}`);

      response.should.have.status(200);
      response.body.id.should.equal(firstGroup.id);
      response.body.name.should.equal(firstGroup.attributes.name);      
    }); // it should...

  }); // describe 'GET /groups/:id

  describe('GET /groups/', () => {
    it('should return 401 when no token is provided', (done) => {
      chai.request(server)
        .get('/api/groups/')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    }); // it should...

    it('should return 401 when a bad token value is provided', (done) => {
      chai.request(server)
        .get('/api/groups/')
        .set('Authorization', 'This is not a token :)')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    }); // it should...

    it('should retrieve all of an authenticated user\'s groups and no others', async () => {
      // GIVEN two groups and a user as a member of ONE of them...
      const userToSave = userHelper.buildUser();
      const user = await User.forge(userToSave).save();
      const token = require('jwt-simple').encode(user.omit('password'), require('../../server/config/auth-config').jwtSecret);
      const firstGroup = await Group.forge({ name: 'Connected group' }).save();
      const attachment = await firstGroup.users().attach(user);
      const secondGroup = await Group.forge({ name: 'Unrelated group' }).save();

      // WHEN that user requests his groups
      const res = await chai.request(server)
        .get('/api/groups/')
        .set('Authorization', `Bearer ${token}`);
              
      // THEN he should successfully retrieve ONLY his own group
      res.should.have.status(200);
      res.body.should.be.an('array');
      res.body.length.should.equal(1);
      res.body[0].id.should.equal(firstGroup.id);
      res.body[0].name.should.equal(firstGroup.attributes.name);
    }); // it should...

  }); // describe 'GET /groups/'

}); // describe 'Groups'