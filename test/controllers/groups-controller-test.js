process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
const should = chai.should();

const User = require('../../server/models/user');
const GroupUser = require('../../server/models/group-user');
const Group = require('../../server/models/group');
const Post = require('../../server/models/post');

const userHelper = require('../helpers/user-helper');
const groupHelper = require('../helpers/group-helper');
const postHelper = require('../helpers/post-helper');

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

  describe('GET /groups/:id/posts', () => {
    it('should return 401 when no token is provided', async () => {
      // GIVEN a group...
      const group = await Group.forge({ name: 'One group' }).save();

      // WHEN a tokenless request is made to see its posts...

      // THEN the request should return 401
      // try-catch due to superagent being a presumptious putz:
      // https://github.com/chaijs/chai-http/issues/75
      try {
        const res = await chai.request(server)
        .get(`/api/groups/${group.id}/posts`)
      } catch(res) {
        res.should.have.status(401);
      }
    }); // it should...

    it('should return 401 when a user unconnected to the group is authenticated', async () => {
      // GIVEN a group...
      const group = await Group.forge({ name: 'One group' }).save();
      const userToSave = userHelper.buildUser();
      const user = await User.forge(userToSave).save();
      const token = await userHelper.getTokenForUser(user, userToSave.password);

      // WHEN a request is made to see the group's posts,
      // but the authenticated user is not in that group...

      // try-catch due to superagent being a presumptious putz:
      // https://github.com/chaijs/chai-http/issues/75
      try {
        const res = await chai.request(server)
        .get(`/api/groups/${group.id}/posts`)
        .set('Authorization', `Bearer ${token}`)
      } catch(res) {
        // THEN the request should return 401
        res.should.have.status(401);
      }
    }); // it should...

    it('should return the group\'s posts when a user connected to the group is authenticated', async () => {
      // GIVEN a post belonging to a user belonging to a group
      // and a post belonging to a different user in that same group
      const group = await Group.forge({ name: 'One group' }).save();
      const firstUserToSave = userHelper.buildUser('First');
      const firstUser = await User.forge(firstUserToSave).save();
      const secondUserToSave = userHelper.buildUser('Second');
      const secondUser = await User.forge(secondUserToSave).save();

      await group.users().attach(firstUser);
      await group.users().attach(secondUser);

      const firstUserPost = await Post.forge(postHelper.buildPost(firstUser, group, 'First')).save();
      const SecondUserPost = await Post.forge(postHelper.buildPost(secondUser, group, 'Second')).save();
      const firstUserToken = await userHelper.getTokenForUser(firstUser, firstUserToSave.password);

      // WHEN one user makes a request to get the group's posts
      const res = await chai.request(server)
      .get(`/api/groups/${group.id}/posts`)
      .set('Authorization', `Bearer ${firstUserToken}`)

      // THEN the response should include both posts belonging to that group
      res.should.have.status(200);
      res.body.posts.should.be.an('array');
      res.body.posts.length.should.equal(2);
    }); // it should...

  });

  describe('GET /groups/:id/users', () => {
    it('should return 401 when no token is provided', async () => {
      // GIVEN a group...
      const group = await Group.forge({ name: 'One group' }).save();

      // WHEN a tokenless request is made to see its posts...

      // try-catch due to superagent being a presumptious putz:
      // https://github.com/chaijs/chai-http/issues/75
      try {
        const res = await chai.request(server)
        .get(`/api/groups/${group.id}/users`)
      } catch(res) {
        // THEN the request should return 401
        res.should.have.status(401);
      }
    }); // it should...

    it('should return 401 when a user unconnected to the group is authenticated', async () => {
      // GIVEN a group...
      const group = await Group.forge({ name: 'One group' }).save();
      const userToSave = userHelper.buildUser();
      const user = await User.forge(userToSave).save();
      const token = await userHelper.getTokenForUser(user, userToSave.password);

      // WHEN a request is made to see the group's users,
      // but the authenticated user is not in that group...

      // try-catch due to superagent being a presumptious putz:
      // https://github.com/chaijs/chai-http/issues/75
      try {
        const res = await chai.request(server)
        .get(`/api/groups/${group.id}/users`)
        .set('Authorization', `Bearer ${token}`)
      } catch(res) {
        // THEN the request should return 401
        res.should.have.status(401);
      }
    }); // it should...

    it('should return the group\'s posts when a user connected to the group is authenticated', async () => {
      // GIVEN a post belonging to a user belonging to a group
      // and a post belonging to a different user in that same group
      const group = await Group.forge({ name: 'One group' }).save();
      const firstUserToSave = userHelper.buildUser('First');
      const firstUser = await User.forge(firstUserToSave).save();
      const secondUserToSave = userHelper.buildUser('Second');
      const secondUser = await User.forge(secondUserToSave).save();

      await group.users().attach(firstUser);
      await group.users().attach(secondUser);

      const firstUserToken = await userHelper.getTokenForUser(firstUser, firstUserToSave.password);

      // WHEN one user makes a GET request to /api/groups/:id/posts
      const res = await chai.request(server)
      .get(`/api/groups/${group.id}/users`)
      .set('Authorization', `Bearer ${firstUserToken}`)

      // THEN the response should include both posts belonging to that group
      res.should.have.status(200);
      res.body.users.should.be.an('array');
      res.body.users.length.should.equal(2);
    }); // it should...
  });

}); // describe 'Groups'