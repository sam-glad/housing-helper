'use strict';

function buildPost(user, group, sequence) {
  const post = {
    title: 'Post',
    price: 10,
    address: '123 Fake St. Boston, MA',
    bedrooms: 2,
    bathrooms: 3,
    square_footage: 2000,
    parking: 'garage',
    housing_type: 'house',
    url: 'https://example.com/',
    user_id: user.id,
    group_id: group.id
  }

  if (sequence || sequence === 0) {
    Object.keys(post).forEach((key) => {
      if (typeof(post[key]) === 'string') {
        post[key] += ` ${sequence}`;
      }
    });
  }

  return post;
}

module.exports = {
  buildPost
};