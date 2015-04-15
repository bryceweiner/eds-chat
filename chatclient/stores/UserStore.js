'use strict';

var assign            = require('object-assign');
var EventEmitter      = require('events').EventEmitter;

var Dispatcher = require('../dispatcher/Dispatcher');
var Action     = require('../constants/Action');

var CHANGE_EVENT = 'change';

var _user =
  { loggedIn: false,
    name: null,
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
    _user.loggedIn = true;
    UserStore.emitChange();
    break;

  case Action.DISCONNECTED:
    _user.loggedIn = false;
    UserStore.emitChange();
    break;
  }

});

module.exports = UserStore;
