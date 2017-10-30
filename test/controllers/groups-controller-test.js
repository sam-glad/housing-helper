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
      const user = userHelper.buildUser();
      await User.forge(user).save();

      const group = groupHelper.buildGroup();
      await Group.forge(group).save();
      const allGroups = await Group.fetchAll();
      const groupToAttach = allGroups.models[0];
      const userToAttach = await User.where('email_address', '!=', user.email_address).fetch();
      groupToAttach.users().attach(userToAttach);

      const token = await userHelper.getTokenForUser(user.email_address, user.password);

      chai.request(server)
        .get(`/api/groups/${groupToAttach.id}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.id.should.equal(groupToAttach.id);
        });
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
      const user = userHelper.buildUser();
      await User.forge(user).save();
      const groupsToSaveSequence = [1];
      const groups = await groupHelper.buildGroups(2, groupsToSaveSequence);
      const connectedGroupId = groups.filter(group => { return group.attached === true })[0].id;
      const token = await userHelper.getTokenForUser(user.email_address, user.password);

      // WHEN that user requests his groups
      chai.request(server)
        .get('/api/groups/')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          // THEN he should successfully retrieve ONLY his own group
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be(1);
          res.body[0].should.be(connectedGroupId);
          done();
        });
    }); // it should...

  }); // describe 'GET /groups/'

}); // describe 'Groups'