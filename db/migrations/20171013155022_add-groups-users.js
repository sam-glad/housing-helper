exports.up = function(knex, Promise) {
  return knex.schema.createTable('groups_users', (table) => {
    table.increments();
    table.integer('group_id').references('groups.id').onDelete('CASCADE');
    table.integer('user_id').references('users.id').onDelete('CASCADE');
    table.timestamps();
  });  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('groups_users');
};