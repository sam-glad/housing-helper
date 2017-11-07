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

    it('should return all posts from the authenticated user\'s groups', async () => {
      // GIVEN a user in one group, plus the "Just me" group,
      // with a post in each group, and a third group with a post...
      const firstUserToSave = userHelper.buildUser(1);
      const firstUser = await User.forge(firstUserToSave).save();
      const secondUser = await User.forge(userHelper.buildUser(2)).save();
      const firstUserToken = await userHelper.getTokenForUser(firstUser, firstUserToSave.password);

      // const groups = await bookshelf.transaction(async () => {
        const firstGroup = await Group.forge({ name: "User's Group" }).save();
        await firstGroup.users().attach(firstUser);
        const separateGroup = await Group.forge({ name: 'Other Group' }).save();
        const firstPostToSave = postHelper.buildPost(firstUser.id, firstGroup.id, "User's First Post");
        const firstPost = await Post.forge(firstPostToSave).save();
        const separatePostToSave = postHelper.buildPost(secondUser.id, separateGroup.id, "Some other group's/user's post");
        const separatePost = await Post.forge(separatePostToSave).save();
      //   return { firstGroup: firstGroup, separateGroup: separateGroup };
      // });

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
}); // describe '/api/posts'

