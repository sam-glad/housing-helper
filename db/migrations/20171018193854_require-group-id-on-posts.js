exports.up = function(knex, Promise) {
  return knex.schema.table('posts', (table) => {
    table.integer('group_id').notNullable().alter();
  });  
};

exports.down = function(knex, Promise) {
  return knex.schema.table('posts', (table) => {
    table.integer('group_id').alter();
  });  
};
