const Group = require('../../server/models/group');

function buildGroup(sequence) {
  const group = {
                  name: 'My Group'
                };
  if (sequence || sequence === 0) {
    group.name += sequence.toString();
  }
  return group;
}

async function deleteAllGroups() {
  await Group.where('id', '!=', '0').destroy();
};

module.exports = {
  buildGroup,
  deleteAllGroups
};