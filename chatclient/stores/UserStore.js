'use strict';

var assign            = require('object-assign');
var EventEmitter      = require('events').EventEmitter;

var Dispatcher = require('../dispatcher/Dispatcher');
var Action     = require('../constants/Action');

var CHANGE_EVENT = 'change';

var _user =
      { name: 'unknown',
        tokenHash: null
      };

var CHANGE_EVENT = 'change';
var UserStore = assign({}, EventEmitter.prototype, {

  init: function(user) {
    _user = user;
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  get: function() {
    return _user;
  }

});

UserStore.dispatchToken = Dispatcher.register(function(action) {

  switch(action.type) {
  case Action.RECEIVE_USERINFO:
    _user.name = action.username;
    UserStore.emitChange();
    break;
  }

});

module.exports = UserStore;
