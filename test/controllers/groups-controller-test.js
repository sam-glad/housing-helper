'use strict'

process.env.NODE_ENV = 'test';

const bookshelf = require('../../db/bookshelf');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
const should = chai.should();

const User = require('../../server/models/user');
const Group = require('../../server/models/group');

const Post = require('../../server/models/post');

const userHelper = require('../helpers/user-helper');
const groupHelper = require('../helpers/group-helper');
const postHelper = require('../helpers/post-helper');

chai.use(chaiHttp);

describe('Groups', () => {
  const badGroupId = 'фу';

  beforeEach(async () => {
    await userHelper.deleteAllUsers();
  });

  describe('GET api/groups/:id', () => {
    it('should return 401 when no user is authenticated', async () => {
      try {
        await chai.request(server)
        .get('/api/groups/1');
      }
      catch(res) {
        res.should.have.status(401);
      }
    }); // it should...

    it('should return 401 when the token passed is not valid', async () => {
      try {
        await chai.request(server)
        .get('/api/groups/1')
        .set('Authorization', 'This is not a token :)');
      }
      catch(res) {
        res.should.have.status(401);
      }
    }); // it should...

    it('should return 401 when the user is not a member of the group in question', async () => {
      // GIVEN a user who is a member of one group but is not a member of another...
      const userToSave = userHelper.buildUser();
      let user, firstGroup, secondGroup;
      await bookshelf.transaction(async (trx) => {
        user = await User.forge(userToSave).save();
        firstGroup = await Group.forge({ name: 'Connected group' }).save();
        await firstGroup.users().attach(user, { transacting: trx });
        secondGroup = await Group.forge({ name: 'Unrelated group' }).save();
      });
      const token = await userHelper.getTokenForUser(user, userToSave.password);

      // WHEN that user tries to retrieve info for the group of which he is NOT a member...
      try {
        await chai.request(server)
        .get(`/api/groups/${secondGroup.id}`)
        .set('Authorization', `Bearer ${token}`);
      } catch(res) {
        // THEN the response should have a 401 status code
        res.should.have.status(401);
      }
    });

    it('should return 400 when passed an invalid group ID', async () => {
      const userToSave = userHelper.buildUser();
      const user = await User.forge(userToSave).save();
      const token = await userHelper.getTokenForUser(user, userToSave.password);

      try {
        await chai.request(server)
        .get(`/api/groups/${badGroupId}`)
        .set('Authorization', `Bearer ${token}`);
      } catch(res) {
        res.should.have.status(400);
      }
    });

    it('should retrieve one group when the user is a member of it', async () => {
      const userToSave = userHelper.buildUser();
      let user, firstGroup;
      await bookshelf.transaction(async (trx) => {
        user = await User.forge(userToSave).save(null, { transacting: trx });  
        firstGroup = await Group.forge({ name: 'Connected group' }).save(null, { transacting: trx });
        await firstGroup.users().attach(user, { transacting: trx });
        const secondGroup = await Group.forge({ name: 'Unrelated group' }).save(null, { transacting: trx });
      });
      const token = await userHelper.getTokenForUser(user, userToSave.password);  

      const response = await chai.request(server)
        .get(`/api/groups/${firstGroup.id}`)
        .set('Authorization', `Bearer ${token}`);

      response.should.have.status(200);
      response.body.id.should.equal(firstGroup.id);
      response.body.name.should.equal(firstGroup.attributes.name);      
    }); // it should...

  }); // describe 'GET /groups/:id

  describe('GET /api/groups/', () => {
    it('should return 401 when no token is provided', async () => {
      try {
        await chai.request(server)
        .get('/api/groups/');
      }
      catch(res) {
        res.should.have.status(401);
      }
    }); // it should...

    it('should return 401 when a bad token value is provided', async () => {
      try {
        await chai.request(server)
        .get('/api/groups/')
        .set('Authorization', 'This is not a token :)');
      }
      catch(res) {
        res.should.have.status(401);
      }
    }); // it should...

    it('should retrieve all of an authenticated user\'s groups and no others', async () => {
      // GIVEN two groups and a user as a member of ONE of them...
      const userToSave = userHelper.buildUser();
      let user, firstGroup;
      await bookshelf.transaction(async (trx) => {
        user = await User.forge(userToSave).save(null, { transacting: trx });;
        firstGroup = await Group.forge({ name: 'Connected group' }).save(null, { transacting: trx });
        await firstGroup.users().attach(user, { transacting: trx });
        const secondGroup = await Group.forge({ name: 'Unrelated group' }).save(null, { transacting: trx });
      });

      const token = await userHelper.getTokenForUser(user, userToSave.password);

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
      try {
        const res = await chai.request(server)
        .get(`/api/groups/${group.id}/posts`)
      } catch(res) {
        res.should.have.status(401);
      }
    }); // it should...

    it('should return 401 when a user unconnected to the group is authenticated', async () => {
      // GIVEN a group...
      let group, user;
      const userToSave = userHelper.buildUser();
      await bookshelf.transaction(async (trx) => {
        group = await Group.forge({ name: 'One group' }).save();
        user = await User.forge(userToSave).save();
      });
      const token = await userHelper.getTokenForUser(user, userToSave.password);

      // WHEN a request is made to see the group's posts,
      // but the authenticated user is not in that group...
      try {
        const res = await chai.request(server)
        .get(`/api/groups/${group.id}/posts`)
        .set('Authorization', `Bearer ${token}`)
      } catch(res) {
        // THEN the request should return 401
        res.should.have.status(401);
      }
    }); // it should...

    it('should return 400 when passed an invalid group ID', async () => {
      const userToSave = userHelper.buildUser();
      const user = await User.forge(userToSave).save();
      const token = await userHelper.getTokenForUser(user, userToSave.password);

      try {
        await chai.request(server)
        .get(`/api/groups/${badGroupId}/posts`)
        .set('Authorization', `Bearer ${token}`);
      } catch(res) {
        res.should.have.status(400);
      }
    }); // it should...

    it('should return the group\'s posts when a user connected to the group is authenticated', async () => {
      // GIVEN a post belonging to a user belonging to a group
      // and a post belonging to a different user in that same group
      const firstUserToSave = userHelper.buildUser('First');
      const secondUserToSave = userHelper.buildUser('Second');
      let group, firstUser;
      await bookshelf.transaction(async (trx) => {
        group = await Group.forge({ name: 'One group' }).save(null, { transacting: trx });
        firstUser = await User.forge(firstUserToSave).save(null, { transacting: trx });
        const secondUser = await User.forge(secondUserToSave).save(null, { transacting: trx });

        await group.users().attach(firstUser, { transacting: trx });
        await group.users().attach(secondUser, { transacting: trx });

        const firstUserPost = await Post.forge(postHelper.buildPost(firstUser.id, group.id, 'First')).save(null, { transacting: trx });
        const SecondUserPost = await Post.forge(postHelper.buildPost(secondUser.id, group.id, 'Second')).save(null, { transacting: trx });
        return;
      });

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

    it('should return 400 when passed an invalid group ID', async () => {
      const userToSave = userHelper.buildUser();
      const user = await User.forge(userToSave).save();
      const token = await userHelper.getTokenForUser(user, userToSave.password);

      try {
        await chai.request(server)
        .get(`/api/groups/${badGroupId}/users`)
        .set('Authorization', `Bearer ${token}`);
      } catch(res) {
        res.should.have.status(400);
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

  describe('POST /groups', () => {
    it('should return 401 with no authenticated (via token) user', async () => {
      try {
        // GIVEN a valid request body
        const groupToInsert = { name: 'This won\'t work' };

        // WHEN the request is made to insert that group with no token provided
        await chai.request(server)
          .post('/api/groups/')
          .send(groupToInsert);
      } catch(res) {
        // THEN the request should come back 401
        res.should.have.status(401);
      }
    }); // it should...

    it('should return 400 with an invalid payload', async () => {
      // GIVEN a user making a request with an invalid payload
      const userToSave = userHelper.buildUser();
      const user = await User.forge(userToSave).save();
      const token = await userHelper.getTokenForUser(user, userToSave.password);
      const emptyPayload = { }; // name is required but not provided

      // WHEN the request is made
      try {
        await chai.request(server)
          .post('/api/groups')
          .set('Authorization', `Bearer ${token}`)
          .send(emptyPayload);
      } catch(res) {
        // THEN it should get a 400 response
        res.should.have.status(400);
      }
    });

    it('should insert a valid group', async () => {
      // GIVEN a user making a request with valid body/headers
      const userToSave = userHelper.buildUser();
      const user = await User.forge(userToSave).save();
      const token = await userHelper.getTokenForUser(user, userToSave.password);
      const groupToInsert = { name: 'This won\'t work' };

      // WHEN the request is made with a valid token
      try {
        await chai.request(server)
          .post('/api/groups/')
          .set('Authorization', `Bearer ${token}`)
          .send(groupToInsert);
      } catch(res) {
        // THEN the request should come back 401
        res.should.have.status(400);
      }
    }); // it should...
  }); // describe 'POST /groups'

}); // describe 'Groups'