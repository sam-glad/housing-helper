'use strict'

process.env.NODE_ENV = 'test';

const bookshelf = require('../../db/bookshelf');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
const should = chai.should();

const User = require('../../server/models/user');

const userHelper = require('../helpers/user-helper');
const groupHelper = require('../helpers/group-helper');

chai.use(chaiHttp);

describe('/api/users', () => {

  beforeEach(async () => {
    await userHelper.deleteAllUsers();
    await groupHelper.deleteAllGroups();
  });

  describe('GET /api/users/search', () => {
    it('should return 401 when no user is authenticated', async () => {
      try {
        // GIVEN a request with no token...
        // WHEN that request is made...
        await chai.request(server)
          .get('/api/users/search?emailAddress=test@example.com');
      }
      catch(res) {
        // THEN the response should have status code 401
        res.should.have.status(401);
      }
    }); // it should....

    it('should return 400 when no query params are provided', async () => {
      // GIVEN a properly validated request with no query params...
      let userToSave = userHelper.buildUser();
      const user = await User.forge(userToSave).save();

      // WHEN the request is made...
      const token = await userHelper.getTokenForUser(user, userToSave.password);
      try {
        await chai.request(server)
        .get('/api/users/search')
        .set('Authorization', `Bearer ${token}`);
      } catch({ response }) {
        // THEN it should get a 400 response with the appropriate message
        response.should.have.status(400);
        response.text.should.equal('Neither email address nor name provided');
      }
      
    }); // it should..

    it('should retrieve the correct user when passed the user\'s email address', async () => {
      // GIVEN two users...
      const usersToSave = userHelper.buildUsers(2);
      const users = await userHelper.insertTwoUsers(usersToSave[0], usersToSave[1]);

      // WHEN one user performs a valid searche for the other by email address...
      const token = await userHelper.getTokenForUser(users[0], usersToSave[0].password);
      const response = await chai.request(server)
        .get(`/api/users/search?emailAddress=${usersToSave[1].email_address}`)
        .set('Authorization', `Bearer ${token}`);

      // THEN the response body should include that user without his password
      response.should.have.status(200);
      response.body.length.should.equal(1);
      response.body[0].id.should.equal(users[1].id);
    }); // it should..

    it('should retrieve users with names resembling the value of the "name" query param', async () => {
      // GIVEN two users with similar names and one with a different name...
      const similarUsersToSave = userHelper.buildUsers(2);
      const differentUserToSave = {
        name_first: 'Foo',
        name_last: 'Bar',
        email_address: 'foo@bar.com',
        password: 'test'
      };

      let similarUsers, differentUser;
      await bookshelf.transaction(async (trx) => {
        similarUsers = await userHelper.insertTwoUsers(similarUsersToSave[0], similarUsersToSave[1]);
        differentUser = await User.forge(differentUserToSave).save();
      });

      // WHEN the different user queries for users with names containing "FirstName"
      const token = await userHelper.getTokenForUser(differentUser, differentUserToSave.password);
      const response = await chai.request(server)
        .get(`/api/users/search?name=Name`)
        .set('Authorization', `Bearer ${token}`);

      // THEN the request should return the two similar users but NOT the different one
      response.should.have.status(200);
      response.body.length.should.equal(similarUsersToSave.length);
      response.body.should.be.an('array');
      response.body[0].id.should.equal(similarUsers[0].id);
      response.body[0].should.have.all.keys('id', 'name_first', 'name_last', 'name_full');
      response.body[0].should.not.have.all.keys('password', 'email_address', 'created_at');
    }); // it should...

  }); // describe GET /api/users/search

  describe('DELETE /api/users/', () => {
    it('should return 401 with no user authenticated', async () => {
      try {
        // GIVEN a request with no token...
        // WHEN that request is made...
        const nonExistentRes = await chai.request(server)
          .delete('/api/users/');
        should.not.exist(nonExistentRes);
      }
      catch(res) {
        // THEN the response should have status code 401
        res.should.have.status(401);
      }
    }); // it should...

    it("should return 400 when the email address in the request body does not match the authenticated user's", async () => {
      // GIVEN a properly authenticated request with a body
      // whose value for email_address is not the authenticated user's email address...
      const setup = await fullSetup();
      const body = {
        emailAddress: "not the user's email address",
        confirmDelete: true
      };

      try {
        // WHEN the request is made...
        const nonExistentRes = await chai.request(server)
          .delete('/api/users/')
          .set('Authorization', `Bearer ${setup.token}`);
        should.not.exist(nonExistentRes);
      } catch(res) {
        // THEN the response should have status code 400
        res.should.have.status(400);
      }
    }); // it should...

    it("should return 400 when the request body's value for confirmDelete is not true", async () => {
      // GIVEN a properly authenticated request with a body
      // whose value for confirmDelete is not true...
      const setup = await fullSetup();
      const body = {
        emailAddress: setup.user.attributes.email_address,
        confirmDelete: 'true'
      };

      try {
        // WHEN the request is made...
        const nonExistentRes = await chai.request(server)
          .delete('/api/users/')
          .set('Authorization', `Bearer ${setup.token}`)
          .send(body);
        should.not.exist(nonExistentRes);
      } catch(res) {
        // THEN the response should have status code 400
        res.should.have.status(400);
      }
    }); // it should...

    it("should return 400 when the request body is missing confirmDelete", async () => {
      // GIVEN a properly authenticated request with a body
      // which is missing confirmDelete...
      const setup = await fullSetup();
      const body = {
        emailAddress: setup.user.attributes.email_address
      };

      try {
        // WHEN the request is made...
        const nonExistentRes = await chai.request(server)
          .delete('/api/users/')
          .set('Authorization', `Bearer ${setup.token}`)
          .send(body);
        should.not.exist(nonExistentRes);
      } catch(res) {
        // THEN the response should have status code 400
        res.should.have.status(400);
      }
    }); // it should...

    it("should return 400 when the request body is missing the email address", async () => {
      // GIVEN a properly authenticated request with a body
      // which is missing the email address...
      const setup = await fullSetup();
      const body = {
        confirmDelete: true
      };

      try {
        // WHEN the request is made...
        const nonExistentRes = await chai.request(server)
          .delete('/api/users/')
          .set('Authorization', `Bearer ${setup.token}`)
          .send(body);
        should.not.exist(nonExistentRes);
      } catch(res) {
        // THEN the response should have status code 400
        res.should.have.status(400);
      }
    }); // it should...

    it("should return 400 when the request has no body", async () => {
      // GIVEN a properly authenticated request with a body
      // which is missing confirmDelete...
      const setup = await fullSetup();

      try {
        // WHEN the request is made...
        const nonExistentRes = await chai.request(server)
          .delete('/api/users/')
          .set('Authorization', `Bearer ${setup.token}`);
        should.not.exist(nonExistentRes);
      } catch(res) {
        // THEN the response should have status code 400
        res.should.have.status(400);
      }
    }); // it should...

    it("should return 204 when the request has a valid body (emailAddress set to user's email address and confirmDelete: true)", async () => {
      // GIVEN a properly authenticated request
      // with a legitimate body
      const setup = await fullSetup();
      const body = {
        emailAddress: setup.user.attributes.email_address,
        confirmDelete: true
      };

      // WHEN the request is made...
      const res = await chai.request(server)
        .delete('/api/users/')
        .set('Authorization', `Bearer ${setup.token}`)
        .send(body);

      // THEN the response should indicate success with status code 204
      res.should.have.status(204);
    }); // it should...

    it("should return 204 when the request has a valid body and the value of emailAddress is not all lower-case", async () => {
      // GIVEN a properly authenticated request with an all-upper-case email address
      // with a legitimate body
      const setup = await fullSetup();
      const body = {
        emailAddress: setup.user.attributes.email_address.toUpperCase(),
        confirmDelete: true
      };

      // WHEN the request is made...
      const res = await chai.request(server)
        .delete('/api/users/')
        .set('Authorization', `Bearer ${setup.token}`)
        .send(body);

      // THEN the response should indicate success with status code 204
      res.should.have.status(204);
    });// it should...

  }); // describe /api/users/search
}); // describe /api/users

async function fullSetup() {
  const userToSave = userHelper.buildUser();
  const user = await User.forge(userToSave).save();
  const token = await userHelper.getTokenForUser(user, userToSave.password);

  return {
    user: user,
    token: token
  };
}

