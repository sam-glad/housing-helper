exports.up = function(knex, Promise) {
  return knex.schema.table('posts', (table) => {
    table.integer('group_id').references('groups.id');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('posts', (table) => {
    table.dropColumn('group_id');
  });
};