exports.up = function(knex, Promise) {
  return knex.schema.table('posts', (table) => {
    table.integer('user_id').references('users.id').notNullable().onDelete('CASCADE');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('posts', (table) => {
    table.dropColumn('user_id');
  });
};
