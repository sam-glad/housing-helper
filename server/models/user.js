'use strict';

const bookshelf = require('../../db/bookshelf');
const Promise = require('bluebird');
const bcrypt = require('bcrypt');
const jwt = require('jwt-simple');

const authConfig = require('../config/auth-config');
require('./post');
require('./group');
const Group = require('./group');
const GroupUser = require('./group-user');
require('./group-user');

function initialize() {
  this.on('saving', async (model) => {
    if (!model.hasChanged('password')) return;

    const salt = await bcrypt.genSalt(authConfig.saltRounds);
    const hashedPassword = await bcrypt.hash(model.attributes.password, salt);
    model.set('password', hashedPassword);
    model.set('name_full', `${model.attributes.name_first} ${model.attributes.name_last}`);
  });

  this.on('created', async (model, resp, options) => {
    // TODO: Transaction here?
    const soloGroup = await Group.forge({ name: 'Just Me', is_just_me: true }).save();
    const attachmentToSave = { user_id: this.get('id'), group_id: soloGroup.id };
    const attachment = await GroupUser.forge(attachmentToSave).save(null, { transacting: options.transacting });
  });
}

async function validPassword(password) {
  return await bcrypt.compare(password, this.attributes.password);
}

function posts() {
  return this.hasMany('Post');
}

function groups() {
  return this.belongsToMany('Group').through('GroupUser');
}

const User = bookshelf.Model.extend({
  tableName: 'users',
  validPassword,
  initialize,
  posts,
  groups
});

module.exports = bookshelf.model('User', User);