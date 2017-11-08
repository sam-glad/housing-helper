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
  });

  describe('/api/posts', () => {
    it('should return 401 when no user is authenticated', async () => {
      try {
        // GIVEN a request with no token...
        // WHEN that request is made...
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
      const numberOfGroupsForUser = 1; // Just "User's Group"
      const numberOfPostsForUser = 1; // Just the one post for "User's Group"
      res.body.length.should.eql(numberOfGroupsForUser); // User is a mem
      res.body[0].id.should.eql(firstGroup.id);
      res.body[0].posts.should.be.an('array');
      res.body[0].posts.length.should.eql(numberOfPostsForUser);
      res.body[0].posts[0].id.should.eql(firstPost.id);
    }); // it should....
  }); // describe '/api/posts/'

  describe('/api/posts/:id', () => {
    it('should return 401 when a user tries to retrieve a post which is in none of his groups', async () => {
      // GIVEN two users, each in one of two groups,
      // and the first user trying to access a post from the second group...
      const setup = await showPostSetup();

      try {
        // WHEN that request is made...
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
      const setup = await showPostSetup();

      // WHEN the request is made...
      const res = await chai.request(server)
        .get(`${urlBase}/${setup.postForFirstGroup.id}`)
        .set('Authorization', `Bearer ${setup.firstUserToken}`);

      // THEN the post should be returned successfully
      res.should.have.status(200);
      res.body.should.be.an('object');
      res.body.id.should.equal(setup.postForFirstGroup.id);
    });
  }); // describe '/api/posts/'

}); // describe '/api/posts'

async function showPostSetup() {
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
    postForFirstGroup = await Post.forge(postHelper.buildPost(firstUser.id, firstGroup.id, 1)).save(null, { transacting: trx });
    postForSecondGroup = await Post.forge(postHelper.buildPost(secondUser.id, secondGroup.id, 2)).save(null, { transacting: trx });
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