'use strict'

process.env.NODE_ENV = 'test';

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
const bookshelf = require('../../db/bookshelf');

chai.use(chaiHttp);

describe('/api/posts/', () => {
  const urlBase = '/api/posts';

  beforeEach(async () => {
    await userHelper.deleteAllUsers();
    await groupHelper.deleteAllGroups();
  });

  describe('GET /api/posts/', () => {
    it('should return 401 when no user is authenticated', async () => {
      try {
        // GIVEN a request with no token...
        // WHEN the request is made...
        await chai.request(server)
          .get(`${urlBase}/`);
      }
      catch(res) {
        // THEN the response should have status code 401
        res.should.have.status(401);
      }
    }); // it should....

    it('should return all posts from the authenticated user\'s groups\'s posts', async () => {
      // GIVEN a user in one group, plus the "Just me" group,
      // with a post in each group, and a third group with a post...
      const firstUserToSave = userHelper.buildUser(1);
      const firstUser = await User.forge(firstUserToSave).save();
      const secondUser = await User.forge(userHelper.buildUser(2)).save();
      const firstUserToken = await userHelper.getTokenForUser(firstUser, firstUserToSave.password);

      let firstGroup, firstPost;
      await bookshelf.transaction(async (trx) => {
        firstGroup = await Group.forge({ name: "User's Group" }).save(null, { transacting: trx });
        await firstGroup.users().attach(firstUser, { transacting: trx });
        const separateGroup = await Group.forge({ name: 'Other Group' }).save(null, { transacting: trx });
        const firstPostToSave = postHelper.buildPost(firstUser.id, firstGroup.id, "User's First Post");
        firstPost = await Post.forge(firstPostToSave).save(null, { transacting: trx });
        const separatePostToSave = postHelper.buildPost(secondUser.id, separateGroup.id, "Some other group's/user's post");
        const separatePost = await Post.forge(separatePostToSave).save(null, { transacting: trx });
      });

      // WHEN the user requests his posts...
      const res = await chai.request(server)
        .get(`${urlBase}/`)
        .set('Authorization', `Bearer ${firstUserToken}`);

      // THEN the the user should get only the posts from his own groups
      res.should.have.status(200);
      const numberOfGroupsForUser = 2; // "Just Me" group plus "User's Group"
      const numberOfPostsForUser = 1; // Just the one post for "User's Group"
      res.body.length.should.eql(numberOfGroupsForUser);
      const notJustMeGroups = res.body.filter((group) => { return group.is_just_me === false });
      notJustMeGroups.length.should.equal(1);
      notJustMeGroups[0].posts.length.should.eql(numberOfPostsForUser);
      notJustMeGroups[0].posts[0].id.should.eql(firstPost.id);
    }); // it should....
  }); // describe GET /api/posts/

  describe('GET /api/posts/:id', () => {
    it('should return 401 when no token is provided', async () => {
      const setup = await testSetup(true);
      try {
        // GIVEN a request with no token...
        // WHEN the request is made...
        await chai.request(server)
          .get(`${urlBase}/${setup.postForFirstGroup.id}`)
      }
      catch(res) {
        // THEN the response should have status code 401
        res.should.have.status(401);
      }
    }); // it should...

    it('should return 401 when a user tries to retrieve a post which is in none of his groups', async () => {
      // GIVEN two users, each in one of two groups,
      // and the first user trying to access a post from the second group...
      const setup = await testSetup(true);

      try {
        // WHEN the request is made...
        await chai.request(server)
          .get(`${urlBase}/${setup.postForSecondGroup.id}`)
          .set('Authorization', `Bearer ${setup.firstUserToken}`);
      }
      catch(res) {
        // THEN the response should have status code 401
        res.should.have.status(401);
      }
    }); // it should....
    it('should return the specified (by ID) post when the authenticated user is in its group', async () => {
      // GIVEN two users, each in one of two groups,
      // and the first user trying to access a post from his own group...
      const setup = await testSetup(true);

      // WHEN the request is made...
      const res = await chai.request(server)
        .get(`${urlBase}/${setup.postForFirstGroup.id}`)
        .set('Authorization', `Bearer ${setup.firstUserToken}`);

      // THEN the post should be returned successfully
      res.should.have.status(200);
      res.body.should.be.an('object');
      res.body.id.should.equal(setup.postForFirstGroup.id);
    });
  }); // describe GET /api/posts/:id

  describe('POST /api/posts/', () => {
    it('should return 401 when no user is authenticated', async () => {
      // GIVEN a POST request with a valid payload but no token...
      const postToSave = postHelper.buildPost();

      // WHEN the request is made...
      try {
        // WHEN the request is made...
        await chai.request(server)
          .post(`${urlBase}/`)
          .send(postToSave);
      }
      catch(res) {
        // THEN the response should have status code 401
        res.should.have.status(401);
      }
    }); // it should...

    it('should return 401 when the authenticated user is not in the indicated group', async () => {
      // GIVEN a request authenticated by a user
      // who is not in the group indicated by the payload's group_id
      const setup = await testSetup();
      const postToSave = postHelper.buildPost();
      postToSave.group_id = setup.secondGroup.id;

      try {
        // WHEN the request is made...
        await chai.request(server)
          .post(`${urlBase}/`)
          .set('Authorization', `Bearer ${setup.firstUserToken}`)
          .send(postToSave);
      }
      catch(res) {
        // THEN the response should have status code 401
        res.should.have.status(401);
      }
    }); //it should...

    // TODO: add model validation and middleware to send 400s for invalid payloads
    // instead of handling this at the controller level

    // it('should return 400 when a properly authenticated user sends an invalid payload with the group_id of a group of which he is a member', async () => {
    //   // GIVEN an otherwise valid request whose user is in the group indicated,
    //   // but whose payload is invalid
    //   const setup = await testSetup();
    //   const invalidPostToSave = { group_id: setup.firstGroup.id };

    //   try {
    //     // WHEN the request is made...
    //     await chai.request(server)
    //       .post(`${urlBase}/`)
    //       .set('Authorization', `Bearer ${setup.firstUserToken}`)
    //       .send(invalidPostToSave);
    //   }
    //   catch(res) {
    //     // THEN the response should have status code 400
    //     res.should.have.status(400);
    //   }
    // }); // it should...

    it('should insert a post when the authenticated user is in the group indicated and the payload is valid', async () => {
      // GIVEN an authenticated user and a valid payload,
      // which indicates that the post will belong to one of the user's groups...
      const setup = await testSetup();
      const postToSave = postHelper.buildPost();
      postToSave.group_id = setup.firstGroup.id;

      // WHEN the request is made...
      const res = await chai.request(server)
        .post(`${urlBase}/`)
        .set('Authorization', `Bearer ${setup.firstUserToken}`)
        .send(postToSave);

      // THEN the post should be successfully inserted
      res.should.have.status(201);
      // res.body.
    }); // it should...
  }); // describe POST /api/posts...

}); // describe '/api/posts'

async function testSetup(createPosts) {
  const firstUserToSave = userHelper.buildUser(1);
  const secondUserToSave = userHelper.buildUser(2);
  const firstGroupToSave = { name: "First user's group" };
  const secondGroupToSave = { name: "Second user's group" };

  let firstUser, secondUser, firstGroup, secondGroup, postForFirstGroup, postForSecondGroup;
  await bookshelf.transaction(async (trx) => {
    firstUser = await User.forge(firstUserToSave).save(null, { transacting: trx });
    secondUser = await User.forge(secondUserToSave).save(null, { transacting: trx });
    firstGroup = await Group.forge(firstGroupToSave).save(null, { transacting: trx });
    secondGroup = await Group.forge(secondGroupToSave).save(null, { transacting: trx });
    await firstGroup.users().attach(firstUser, { transacting: trx });
    await secondGroup.users().attach(secondUser, { transacting: trx });
    if (createPosts) {
      postForFirstGroup = await Post.forge(postHelper.buildPost(firstUser.id, firstGroup.id, 1)).save(null, { transacting: trx });
      postForSecondGroup = await Post.forge(postHelper.buildPost(secondUser.id, secondGroup.id, 2)).save(null, { transacting: trx });
    }
  });
  const firstUserToken = await userHelper.getTokenForUser(firstUser, firstUserToSave.password);

  return {
    firstUser: firstUser,
    secondUser: secondUser,
    firstGroup: firstGroup,
    secondGroup: secondGroup,
    postForFirstGroup: postForFirstGroup,
    postForSecondGroup: postForSecondGroup,
    firstUserToken: firstUserToken
  };
}