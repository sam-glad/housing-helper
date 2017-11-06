exports.up = function(knex, Promise) {
  return knex.schema.raw(`CREATE INDEX users_name_full_lower_index ON users (LOWER(name_full));`)
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.dropIndex('name_full_lower');
  });  
};
