exports.up = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('username');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.string('username').notNullable().unique();
  });
};
