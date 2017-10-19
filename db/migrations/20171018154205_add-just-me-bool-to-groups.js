exports.up = function(knex, Promise) {
  return knex.schema.table('groups', (table) => {
    table.boolean('is_just_me').notNullable().defaultTo(false);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('groups', (table) => {
    table.dropColumn('is_just_me');
  });
};
