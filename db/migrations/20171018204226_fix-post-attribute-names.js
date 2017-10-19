exports.up = function(knex, Promise) {
  return knex.schema.table('posts', (table) => {
    table.renameColumn('squareFootage', 'square_footage');
    table.renameColumn('housingType', 'housing_type');
    table.renameColumn('craigslistPostId', 'craigslist_post_id');
  });  
};

exports.down = function(knex, Promise) {
  return knex.schema.table('posts', (table) => {
    table.renameColumn('square_footage', 'squareFootage');
    table.renameColumn('housing_type', 'housingType');
    table.renameColumn('craigslist_post_id', 'craigslistPostId');
  });
};
