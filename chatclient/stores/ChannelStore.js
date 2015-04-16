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
      var cid = rawMessage.cid;
      var channel   = _channels[cid];

      if (!channel)
        return console.log('[msg] Dropping message', rawMessage);

      if (cid != _currentId)
        channel.unreadCount++;
    }, this);

    if (!_currentId) {
      var allSorted = this.getAllSorted();
      var channel = allSorted[0];
      _currentId = channel.cid;
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

  getAllSorted: function() {
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

    case Action.RECEIVE_CHANNEL_INFO:
      console.log('[STORE] Processing channel info');
      var cinfo   = action.channelInfo;
      var cid     = cinfo.cid;

      var channel;
      if (!_channels.hasOwnProperty(cid)) {
        console.log('[STORE] Creating new channel');
        channel = _channels[cid] =
          {
            cid: cid,
            lastRead: -1,
            unreadCount: 0
          };
      }
      else
        channel = _channels[cid];
      channel.name = cinfo.aname + '#' + cinfo.cname;

      ChannelStore.init(cinfo.history);
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
