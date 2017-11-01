const jwt = require('jwt-simple');
const Promise = require('bluebird');

const User = require('../../server/models/user');
const authConfig = require('../../server/config/auth-config');

function buildUser(sequence) {
  const user = {
                 name_first: 'First name',
                 name_last: 'Last name',
                 name_full: 'First name Last name', // TODO: Automate this... good lord
                 email_address: 'test@example.com',
                 password: 'pass'
               };
  if (sequence || sequence === 0) {
    Object.keys(user).forEach((key) => {
      if (typeof(user[key]) === 'string') {
        user[key] += ` ${sequence}`;
      }
    });
  }
  return user;
}

async function deleteAllUsers() {
  await User.where('id', '!=', '0').destroy();
};

// Oh god
async function getTokenForUser(user, password) {
  try {
    const isValidPassword = await user.validPassword(password);
    if (isValidPassword) {
      const token = jwt.encode(user.omit('password'), authConfig.jwtSecret);
      return token;
    }
  }
  catch(error) {
    throw new Error(error);
  }
}

module.exports = {
  buildUser,
  deleteAllUsers,
  getTokenForUser
};