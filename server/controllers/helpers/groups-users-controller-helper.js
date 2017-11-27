'use strict'

function validateGroupIdForPostInput(groupId) {
  return Boolean(groupId && typeof groupId === 'number');
}

function validateUsersForPostInput(users) {
  if (!users || !users.length || users.length === 0) { return false; }

  for(let i = 0; i < users.length; i++) {
    if (!users[i].id || typeof users[i].id !== 'number') { return false; }
  }

  return true;
}

function validatePostInput(groupId, users) {
  const isGroupIdValid = validateGroupIdForPostInput(groupId);
  const isUsersValid = validateUsersForPostInput(users)
  return isGroupIdValid && isUsersValid;
}

module.exports = {
  validateGroupIdForPostInput,
  validateUsersForPostInput,
  validatePostInput
};