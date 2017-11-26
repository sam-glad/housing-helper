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

chai.use(chaiHttp);

describe('/api/groups-users/', () => {
  const urlBase = '/api/groups-users/';

  beforeEach(async () => {
    await userHelper.deleteAllUsers();
    await groupHelper.deleteAllGroups();
  });

  describe('POST /api/groups-users/', () => {
    it('should return 401 when no user is authenticated', async () => {
      const setup = await testSetup();
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
  }); // describe POST /api/groups-users/
}); // describe /api/groups-users/

async function testSetup() {
  const group = await Group.forge({ name: 'Successfully Saved Group' }).save();
  return {
    validPayload: { group_id: group.id }
  };
}