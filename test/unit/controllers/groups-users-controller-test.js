'use strict'

process.env.NODE_ENV = 'test';

const groupsUsersControllerHelper = require('../../../server/controllers/helpers/groups-users-controller-helper');

const chai = require('chai');
const should = chai.should();

describe('Groups-users controller helper', () => {
  const validGroupId = 1;
  const validUsers = [{ id: 2 }];

  describe('With bad group ID input', () => {
    let invalidGroupId;

    it('should return false with no group_id', () => {
      groupsUsersControllerHelper.validatePostInput(invalidGroupId, validUsers).should.eql(false);
    }); // it should....

    it('should return false with a non-integer group_id', () => {
      invalidGroupId = "I'm a string";
      groupsUsersControllerHelper.validatePostInput(invalidGroupId, validUsers).should.eql(false);
    }); // it should....
  }); // describe bad group ID input

  describe('With bad users input', () => {
    let invalidUsers;

    it('should return false with no users', () => {
      groupsUsersControllerHelper.validatePostInput(validGroupId, invalidUsers).should.eql(false);
    });

    it('should return false when users is not an array', () => {
      invalidUsers = { id: 1 };
      groupsUsersControllerHelper.validatePostInput(validGroupId, invalidUsers).should.eql(false);
    });

    it('should return false when users has length 0', () => {
      invalidUsers = [];
      groupsUsersControllerHelper.validatePostInput(validGroupId, invalidUsers).should.eql(false);
    });

    it("should return false when a user's ID is not a number", () => {
      invalidUsers = { id: "I'm a string!" };
      groupsUsersControllerHelper.validatePostInput(validGroupId, invalidUsers).should.eql(false);
    });

    it('should return false when one user is valid and one is not', () => {
      invalidUsers = [{ id: 1 }, 2];
      groupsUsersControllerHelper.validatePostInput(validGroupId, invalidUsers).should.eql(false);
    });

    it('should return false when no user is valid', () => {
      invalidUsers = [1, 2];
      groupsUsersControllerHelper.validatePostInput(validGroupId, invalidUsers).should.eql(false);
    });
  });

  describe('With valid group_id and users input', () => {
    it('should return true' , () => {
      groupsUsersControllerHelper.validatePostInput(validGroupId, validUsers).should.eql(true);
    });
  });

}); // describe Groups-users controller unit tests