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
      const setupIncludeSecondGroup = true;
      const includePosts = false;
      const setup = await fullSetup(setupIncludeSecondGroup, includePosts);

      // WHEN that user tries to retrieve info for the group of which he is NOT a member...
      try {
        await chai.request(server)
        .get(`/api/groups/${setup.secondGroup.id}`)
        .set('Authorization', `Bearer ${setup.token}`);
      } catch(res) {
        // THEN the response should have a 401 status code
        res.should.have.status(401);
      }
    }); // it should...

    it('should return 400 when passed an invalid group ID', async () => {
      // GIVEN a request with a valid token but invalid group ID URL param
      const setup = await oneUserOneGroupSetup();

      try {
        // WHEN the request is made
        await chai.request(server)
        .get(`/api/groups/${badGroupId}`)
        .set('Authorization', `Bearer ${setup.token}`);
      } catch(res) {
        // THEN the response should have a 400 status code
        res.should.have.status(400);
      }
    }); // it should...

    it('should retrieve one group when the user is a member of it', async () => {
      // GIVEN a group and an attached user...
      const includeGroup = true;
      const attachUserToGroup = true;
      const setup = await oneUserOneGroupSetup(includeGroup, attachUserToGroup);

      // WHEN that user tries to view that group
      const response = await chai.request(server)
        .get(`/api/groups/${setup.group.id}`)
        .set('Authorization', `Bearer ${setup.token}`);

      // THEN the request should successfully return the group
      response.should.have.status(200);
      response.body.id.should.equal(setup.group.id);
      response.body.name.should.equal(setup.group.attributes.name);      
    }); // it should...

  }); // describe GET /groups/:id

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
      const includeSecondGroup = true;
      const includePosts = false;
      const setup = await fullSetup(includeSecondGroup, includePosts);

      // WHEN that user requests his groups
      const res = await chai.request(server)
        .get('/api/groups/')
        .set('Authorization', `Bearer ${setup.firstUserToken}`);
              
      // THEN he should successfully retrieve ONLY his own group
      res.should.have.status(200);
      res.body.should.be.an('array');
      res.body.length.should.equal(1);
      res.body[0].id.should.equal(setup.firstGroup.id);
      res.body[0].name.should.equal(setup.firstGroup.attributes.name);
    }); // it should...

  }); // describe GET /groups/

  describe('GET /groups/:id/posts', () => {
    it('should return 401 when no token is provided', async () => {
      // GIVEN a group...
      const group = await Group.forge({ name: 'One group' }).save();

      // WHEN a tokenless request is made to see its posts...
      try {
        const res = await chai.request(server)
        .get(`/api/groups/${group.id}/posts`)
      } catch(res) {
        // THEN the request should return 401
        res.should.have.status(401);
      }
    }); // it should...

    it('should return 401 when a user unconnected to the group is authenticated', async () => {
      // GIVEN a group...
      const setup = await oneUserOneGroupSetup(true, false);

      // WHEN a request is made to see the group's posts,
      // but the authenticated user is not in that group...
      try {
        const res = await chai.request(server)
        .get(`/api/groups/${setup.group.id}/posts`)
        .set('Authorization', `Bearer ${setup.token}`)
      } catch(res) {
        // THEN the request should return 401
        res.should.have.status(401);
      }
    }); // it should...

    it('should return 400 when passed an invalid group ID', async () => {
      const setup = await oneUserOneGroupSetup();

      try {
        await chai.request(server)
        .get(`/api/groups/${badGroupId}/posts`)
        .set('Authorization', `Bearer ${setup.token}`);
      } catch(res) {
        res.should.have.status(400);
      }
    }); // it should...

    it('should return the group\'s posts when a user connected to the group is authenticated', async () => {
      // GIVEN a post belonging to a user belonging to a group
      // and a post belonging to a different user in that same group
      const includeSecondGroup = false;
      const includePosts = true;
      const setup = await fullSetup(includeSecondGroup, includePosts);

      // WHEN one user makes a request to get the group's posts
      const res = await chai.request(server)
      .get(`/api/groups/${setup.firstGroup.id}/posts`)
      .set('Authorization', `Bearer ${setup.firstUserToken}`)

      // THEN the response should include both posts belonging to that group
      res.should.have.status(200);
      res.body.posts.should.be.an('array');
      res.body.posts.length.should.equal(2);
      const postIds = res.body.posts.map((post) => { return post.id });
      postIds.should.have.members([setup.firstUserFirstGroupPost.id, setup.secondUserFirstGroupPost.id]);
    }); // it should...

  }); // describe GET /groups/:id/posts

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
      const setup = await oneUserOneGroupSetup(true, false);

      // WHEN a request is made to see the group's users,
      // but the authenticated user is not in that group...
      try {
        const res = await chai.request(server)
        .get(`/api/groups/${setup.group.id}/users`)
        .set('Authorization', `Bearer ${setup.token}`)
      } catch(res) {
        // THEN the request should return 401
        res.should.have.status(401);
      }
    }); // it should...

    it('should return 400 when passed an invalid group ID', async () => {
      const setup = await oneUserOneGroupSetup();

      try {
        await chai.request(server)
        .get(`/api/groups/${badGroupId}/users`)
        .set('Authorization', `Bearer ${setup.token}`);
      } catch(res) {
        res.should.have.status(400);
      }
    }); // it should...

    it('should return the group\'s users when a user connected to the group is authenticated', async () => {
      // GIVEN a post belonging to a user belonging to a group
      // and a post belonging to a different user in that same group
      const includeSecondGroup = false;
      const includePosts = false;
      const setup = await fullSetup(includeSecondGroup, includePosts);

      // WHEN one user makes a GET request to /api/groups/:id/posts
      const res = await chai.request(server)
      .get(`/api/groups/${setup.firstGroup.id}/users`)
      .set('Authorization', `Bearer ${setup.firstUserToken}`)

      // THEN the response should include both posts belonging to that group
      res.should.have.status(200);
      res.body.id.should.eql(setup.firstGroup.id);
      res.body.name.should.eql(setup.firstGroup.attributes.name);
      res.body.users.should.be.an('array');
      res.body.users.length.should.equal(2);
      const userIds = res.body.users.map((user) => { return user.id; });
      userIds.should.have.members([setup.firstUser.id, setup.secondUser.id]);
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
      const setup = await oneUserOneGroupSetup();
      const emptyPayload = { }; // name is required but not provided

      // WHEN the request is made
      try {
        await chai.request(server)
          .post('/api/groups')
          .set('Authorization', `Bearer ${setup.token}`)
          .send(emptyPayload);
      } catch(res) {
        // THEN it should get a 400 response
        res.should.have.status(400);
      }
    });

    it('should insert a valid group', async () => {
      // GIVEN a user making a request with valid body/headers
      const setup = await oneUserOneGroupSetup();
      const groupToInsert = { name: 'This should work' };

      // WHEN the request is made with a valid token
      const res = await chai.request(server)
        .post('/api/groups/')
        .set('Authorization', `Bearer ${setup.token}`)
        .send(groupToInsert);

      // THEN the request should successfully insert the group
      res.should.have.status(201);
      res.body.name.should.eql(groupToInsert.name);
    }); // it should...
  }); // describe POST /groups

}); // describe 'Groups'

async function fullSetup(includeSecondGroup, includePosts) {
  const firstUserToSave = userHelper.buildUser('First');
  const secondUserToSave = userHelper.buildUser('Second');
  const thirdUserToSave = userHelper.buildUser('Third');
  
  let firstUser, secondUser, thirdUser, firstGroup, secondGroup, firstUserFirstGroupPost, secondUserFirstGroupPost;
  await bookshelf.transaction(async (trx) => {
    firstUser = await User.forge(firstUserToSave).save(null, { transacting: trx });
    secondUser = await User.forge(secondUserToSave).save(null, { transacting: trx });
    firstGroup = await Group.forge({ name: 'First group' }).save(null, { transacting: trx });
    await firstGroup.users().attach(firstUser, { transacting: trx });
    await firstGroup.users().attach(secondUser, { transacting: trx });
    
    if (includePosts) {
      firstUserFirstGroupPost = await Post.forge(postHelper.buildPost(firstUser.id, firstGroup.id, 'First')).save(null, { transacting: trx });
      secondUserFirstGroupPost = await Post.forge(postHelper.buildPost(secondUser.id, firstGroup.id, 'Second')).save(null, { transacting: trx });
    }

    if (includeSecondGroup) {
      secondGroup = await Group.forge({ name: 'Second Group' }).save(null, { transacting: trx });
    }
  });
  const firstUserToken = await userHelper.getTokenForUser(firstUser, firstUserToSave.password);

  return {
    firstUser: firstUser,
    secondUser: secondUser,
    thirdUser: thirdUser,
    firstGroup: firstGroup,
    secondGroup: secondGroup,
    firstUserFirstGroupPost: firstUserFirstGroupPost,
    secondUserFirstGroupPost: secondUserFirstGroupPost,
    firstUserToken: firstUserToken
  };
}

async function oneUserOneGroupSetup(includeGroup, attachUserToGroup) {
  const userToSave = userHelper.buildUser();
  const groupToSave = { name: 'The only group' };
  let user, group;

  await bookshelf.transaction(async (trx) => {
    user = await User.forge(userToSave).save(null, { transacting: trx });
    if (includeGroup) {
      group = await Group.forge(groupToSave).save(null, { transacting: trx });
      if (attachUserToGroup) {
       await group.users().attach(user, { transacting: trx });
      }
    }
  });

  const token = await userHelper.getTokenForUser(user, userToSave.password);
  return {
    user: user,
    group: group,
    token: token
  };
}