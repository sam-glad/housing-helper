const User = require('../../server/models/user');

function buildUser(sequence) {
  const user = {
                 name_first: 'First name',
                 name_last: 'Last name',
                 name_full: 'First name Last name', // TODO: Automate this... good lord
                 email_address: 'test@example.com',
                 password: 'pass'
               };
  if (sequence) {
    Object.keys(user).forEach(key => {
      user[key] += sequence;
    });
  }
  return user;
}

async function deleteAllUsers() {
  await User.where('id', '!=', '0').destroy();
};

module.exports = {
  buildUser,
  deleteAllUsers
};