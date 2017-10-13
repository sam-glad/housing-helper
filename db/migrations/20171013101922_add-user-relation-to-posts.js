exports.up = function(knex, Promise) {
  return knex.schema.table('posts', (table) => {
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('users.id');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('posts', (table) => {
    table.dropColumn('user_id');
  });
};
