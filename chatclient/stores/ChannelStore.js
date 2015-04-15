'use strict';

var assign            = require('object-assign');
var EventEmitter      = require('events').EventEmitter;

var Dispatcher = require('../dispatcher/Dispatcher');
var Action     = require('../constants/Action');

var CHANGE_EVENT = 'change';

var _currentId = null;
var _channels = {};

var ChannelStore = assign({}, EventEmitter.prototype, {

  init: function(rawMessages) {
    rawMessages.forEach(function(rawMessage) {
      var channelId = rawMessage.cid;
      var channel   = _channels[channelId];

      if (!channel) {
        channel = _channels[channelId] = {
          id:          channelId,
          name:        rawMessage.channelName || channelId,
          lastRead:    -1,
          unreadCount:  0
        };
      }

      if (channelId != _currentId)
        channel.unreadCount++;
    }, this);

    if (!_currentId) {
      var allChrono = this.getAllChrono();
      var channel = allChrono[0];
      _currentId = channel.id;
      channel.unreadCount = 0;
    }
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

  get: function(id) {
    return _channels[id];
  },

  getAll: function() {
    return _channels;
  },

  getAllChrono: function() {
    var orderedChannels = [];
    for (var id in _channels) {
      var channel = _channels[id];
      orderedChannels.push(channel);
    }
    orderedChannels.sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });
    return orderedChannels;
  },

  getCurrentId: function() {
    return _currentId;
  },

  getCurrent: function() {
    return this.get(this.getCurrentId());
  }

});

ChannelStore.dispatchToken =
  Dispatcher.register(function(action) {

    switch(action.type) {
    case Action.CLICK_CHANNEL:
      _currentId = action.channelId;
      _channels[_currentId].lastRead = Date.now();
      _channels[_currentId].unreadCount = 0;
      ChannelStore.emitChange();
      break;

    case Action.RECEIVE_MESSAGES:
      ChannelStore.init(action.rawMessages);
      ChannelStore.emitChange();
      break;

    case Action.RECEIVE_MESSAGE:
      ChannelStore.init([action.rawMessage]);
      ChannelStore.emitChange();
      break;
    }
});

module.exports = ChannelStore;
