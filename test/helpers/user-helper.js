const bookshelf = require('../../db/bookshelf');

const jwt = require('jwt-simple');

const User = require('../../server/models/user');
const authConfig = require('../../server/config/auth-config');

function buildUser(sequence) {
  const user = {
                 name_first: 'FirstName',
                 name_last: 'LastName',
                 email_address: 'test@example.com',
                 password: 'pass'
               };
  if (sequence || sequence === 0) {
    Object.keys(user).forEach((key) => {
      if (typeof(user[key]) === 'string') {
        key === 'email_address' ? user[key] = user[key].split('@').join(`${sequence}@`) : user[key] += ` ${sequence}`;
      }
    });
  }
  return user;
}

function buildUsers(numberOfUsers) {
  let usersToSave = [];
  for(let i = 1;i <= numberOfUsers;i++) {
    usersToSave.push(buildUser(i));
  };
  return usersToSave;
}

// Ugh
async function insertTwoUsers(firstUserToSave, secondUserToSave) {
  return await bookshelf.transaction(async () => {
    let users = [];
    const firstUser = await User.forge(firstUserToSave).save();
    users.push(firstUser);
    const secondUser = await User.forge(secondUserToSave).save();
    users.push(secondUser);
    return [firstUser, secondUser];
  });
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
  buildUsers,
  insertTwoUsers,
  deleteAllUsers,
  getTokenForUser
};