'use strict'

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
const should = chai.should();

const User = require('../../server/models/user');
const Group = require('../../server/models/group');

const userHelper = require('../helpers/user-helper');
const groupHelper = require('../helpers/group-helper');
const bookshelf = require('../../db/bookshelf');

chai.use(chaiHttp);

describe('/api/groups-users/', () => {
  const urlBase = '/api/groups-users';

  beforeEach(async () => {
    await userHelper.deleteAllUsers();
    await groupHelper.deleteAllGroups();
  });

  describe('POST /api/groups-users/', () => {
    it('should return 401 when no user is authenticated', async () => {
      const attachFirstUserToFirstGroup = false;
      const setup = await testSetup(attachFirstUserToFirstGroup);

      try {
        // GIVEN a request with a valid payload and no token...
        // WHEN the request is made...
        const res = await chai.request(server)
          .post(`${urlBase}/`)
          .send(setup.validPayload);
        should.not.exist(res);
      }
      catch(res) {
        // THEN the response should have status code 401
        res.should.have.status(401);
      }
    }); // it should...

    it('should return 401 when an authenticated user attempts to insert a group-user for a group to which he does not belong', async () => {
      const attachFirstUserToFirstGroup = false;
      const setup = await testSetup(attachFirstUserToFirstGroup);

      try {
        // GIVEN an otherwise valid request with a token
        // for a user who is NOT a member of the group specified in the payload...
        // WHEN the request is made...
        const res = await chai.request(server)
          .post(`${urlBase}/`)
          .set('Authorization', `Bearer ${setup.firstUserToken}`)
          .send(setup.validPayload);
        should.not.exist(res);
      }
      catch(res) {
        // THEN the response should have status code 401
        res.should.have.status(401);
      }
    }); // it should...

    it('should return 400 when the request body is invalid', async () => {
      const attachFirstUserToFirstGroup = false;
      const setup = await testSetup(attachFirstUserToFirstGroup);
      const badPayload = {};

      try {
        // GIVEN a request with a valid token but invalid payload...
        // WHEN the request is made...
        const res = await chai.request(server)
          .post(`${urlBase}/`)
          .set('Authorization', `Bearer ${setup.firstUserToken}`)
          .send(badPayload);
        should.not.exist(res);
      }
      catch(res) {
        // THEN the response should have status code 401
        res.should.have.status(400);
      }
    }); // it should

    it('should return 201 for a valid request', async () => {
      const attachFirstUserToFirstGroup = true;
      const setup = await testSetup(attachFirstUserToFirstGroup);

      // GIVEN a request with a valid token and valid payload...
      // WHEN the request is made...
      const res = await chai.request(server)
        .post(`${urlBase}/`)
        .set('Authorization', `Bearer ${setup.firstUserToken}`)
        .send(setup.validPayload);
      // THEN it should insert a group-user
      res.should.have.status(201);
      res.body.id.should.eql(setup.firstGroup.id);
      res.body.users.filter((user) => { return user.id === setup.secondUser.id }).should.exist;
    }); // it should
  }); // describe POST /api/groups-users/
}); // describe /api/groups-users/

async function testSetup(attachFirstUserToFirstGroup) {
  const firstUserToSave = userHelper.buildUser(1);
  const secondUserToSave = userHelper.buildUser(2);
  const firstGroupToSave = { name: 'First Group' };
  const secondGroupToSave = { name: 'Second Group' };

  let firstUser, secondUser, firstGroup, secondGroup, firstUserToken;
  await bookshelf.transaction(async (trx) => {
    firstUser = await User.forge(firstUserToSave).save(null, { transacting: trx });
    secondUser = await User.forge(secondUserToSave).save(null, { transacting: trx });
    firstGroup = await Group.forge(firstGroupToSave).save(null, { transacting: trx });
    secondGroup = await Group.forge(secondGroupToSave).save(null, { transacting: trx });
    if (attachFirstUserToFirstGroup) {
      await firstGroup.users().attach(firstUser, { transacting: trx });
    }
    firstUserToken = await userHelper.getTokenForUser(firstUser, firstUserToSave.password);
  });

  return {
    validPayload: {
      group_id: firstGroup.id,
      users: [{ id: secondUser.id }]
    },
    firstUser: firstUser,
    secondUser: secondUser,
    firstGroup: firstGroup,
    secondGroup: secondGroup,
    firstUserToken: firstUserToken
  };
}