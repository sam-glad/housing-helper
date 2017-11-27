'use strict'

function validatePostInput(groupId, users) {
  if (!groupId || typeof groupId !== 'number') {
    return false
  }

  if (!users || !users.length || users.length === 0) {
    return false;
  }

  for(let i = 0; i < users.length; i++) {
    if (!users[i].id || typeof users[i].id !== 'number') {
      return false;
    }
  }

  return true;
}

module.exports = {
  validatePostInput
};