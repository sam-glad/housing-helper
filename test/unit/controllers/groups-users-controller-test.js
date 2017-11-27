'use strict'

process.env.NODE_ENV = 'test';

const groupsUsersControllerHelper = require('../../../server/controllers/helpers/groups-users-controller-helper');

const chai = require('chai');
const should = chai.should();

describe('Groups-users controller helper', () => {
  const validGroupId = 1;
  const validUsers = [{ id: 1 }, { id: 2 }];

  describe('validateGroupIdForPostInput', () => {
    it('should return false with no group_id', () => {
      groupsUsersControllerHelper.validateGroupIdForPostInput().should.eql(false);
    });

    it('should return false with a non-number group_id', () => {
      const nonNumberInvalidGroupId = "I'm a string";
      groupsUsersControllerHelper.validateGroupIdForPostInput(nonNumberInvalidGroupId).should.eql(false);
    });

    it('should return true with a number group ID', () => {
      groupsUsersControllerHelper.validateGroupIdForPostInput(validGroupId).should.eql(true);
    });
  }); // describe validateGroupIdForPostInput

  describe('validateUsersForPostInput', () => {
    it('should return false with no users', () => {
      groupsUsersControllerHelper.validateUsersForPostInput().should.eql(false);
    });

    it('should return false when users is not an array', () => {
      const nonArrayInvalidUsers = { id: 1 };
      groupsUsersControllerHelper.validateUsersForPostInput(nonArrayInvalidUsers).should.eql(false);
    });

    it('should return false when users has length 0', () => {
      const lengthZeroInvalidUsers = [];
      groupsUsersControllerHelper.validateUsersForPostInput(lengthZeroInvalidUsers).should.eql(false);
    });

    it("should return false when a user's ID is not a number", () => {
      const nonNumberInvalidUsers = { id: "I'm a string!" };
      groupsUsersControllerHelper.validateUsersForPostInput(nonNumberInvalidUsers).should.eql(false);
    });

    it('should return false when one user is valid and one is not', () => {
      const oneValidOneInvalidUsers = [{ id: 1 }, 2];
      groupsUsersControllerHelper.validateUsersForPostInput(oneValidOneInvalidUsers).should.eql(false);
    });

    it('should return false when no user is valid', () => {
      const allInvalidUsers = [1, 2];
      groupsUsersControllerHelper.validateUsersForPostInput(allInvalidUsers).should.eql(false);
    });

    it('should return true when all users are valid', () => {
      groupsUsersControllerHelper.validateUsersForPostInput(validUsers).should.eql(true);
    });
  }); // describe validateUsersForPostInput

  describe('With valid group_id and users input', () => {
    it('should return false with invalid group ID and valid users', () => {
      groupsUsersControllerHelper.validatePostInput(validGroupId, {}).should.eql(false);
    });

    it('should return false with valid group ID and invalid users', () => {
      groupsUsersControllerHelper.validatePostInput({}, validUsers).should.eql(false);
    });

    it('should return true with valid users and group ID' , () => {
      groupsUsersControllerHelper.validatePostInput(validGroupId, validUsers).should.eql(true);
    });
  }); // describe validatePostInput

}); // describe Groups-users controller helper