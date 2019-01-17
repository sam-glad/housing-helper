const Group = require('../../server/models/group');
const User = require('../../server/models/user');

function buildGroup(sequence) {
  const group = {
                  name: 'My Group'
                };
  if (sequence || sequence === 0) {
    group.name += sequence.toString();
  }
  return group;
}

// numGroups: number
// sequencesOfGroupToAttach: array of numbers
async function buildGroups(numGroups, sequencesOfGroupToAttach) {
  let groups = [];
  for (let i = 1; i <= numGroups; i++) {
    const group = buildGroup(i);
    await Group.forge(group).save();
    group.attached = false;
    if (sequencesOfGroupToAttach.includes(i)) {
      // TODO: Revisit this sloppy, fragile garbage
      const groupToAttach = await Group.where('name', 'LIKE', `%${i}`).fetch();
      const userToAttach = await User.where('id', '!=', '0').fetch();
      await groupToAttach.users().attach(userToAttach);
      group.attached = true;
    }
    groups.push(group);
  }
  return groups;
}

async function deleteAllGroups() {
  await Group.where('id', '!=', '0').destroy({ require: false });
};

module.exports = {
  buildGroup,
  buildGroups,
  deleteAllGroups
};
