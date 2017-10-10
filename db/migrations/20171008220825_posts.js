exports.up = function(knex, Promise) {
  return knex.schema.createTable('posts', (table) => {
    table.increments();
    table.string('title').notNullable().unique();
    table.float('price').notNullable();
    table.string('address').unique();
    table.integer('bedrooms').notNullable();
    table.integer('bathrooms').notNullable();
    table.integer('squareFootage')
    table.string('parking');
    table.string('housingType');
    table.string('url').unique().notNullable();
    table.string('craigslistPostId').unique();
    table.timestamps();
  });  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('posts');
};
