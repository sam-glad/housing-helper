exports.up = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.string('email_address').notNullable().unique();
    table.string('name_first').notNullable();
    table.string('name_last').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('email_address');
    table.dropColumn('name_first');
    table.dropColumn('name_last');
  });
};
