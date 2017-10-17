exports.up = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.string('name_full').notNullable();
  });  
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('name_full');
  });
};
