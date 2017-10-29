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
    });

    it('should return 401 when the token passed is not valid', (done) => {
      chai.request(server)
        .get('/api/groups/1')
        .set('Authorization', 'This is not a token :)')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

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
    });
  });

  describe('GET /groups/', () => {
    it('should return 401 when no token is provided', (done) => {
      chai.request(server)
        .get('/api/groups/')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should return 401 when a bad token value is provided', (done) => {
      chai.request(server)
        .get('/api/groups/')
        .set('Authorization', 'This is not a token :)')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should retrieve all of an authenticated user\'s groups and no others', async () => {
      const user = userHelper.buildUser();
      let connectedGroupId;
      await User.forge(user).save();
      const groupSequence = 1;

      // TODO: Desloppify
      for(let i = 0; i < 2; i++) {
        const group = groupHelper.buildGroup(i);
        await Group.forge(group).save();
        if (i === groupSequence) {
          const groupToAttach = await Group.where('name', 'LIKE', `%${i}`).fetch();
          connectedGroupId = groupToAttach.id;
          const userToAttach = await User.where('id', '!=', '0').fetch();
          groupToAttach.users().attach(userToAttach);
        }
      }

      const token = await userHelper.getTokenForUser(user.email_address, user.password);

      chai.request(server)
        .get('/api/groups/')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be(1);
          res.body[0].should.be(connectedGroupId);
          done();
        });
    });

  });

});