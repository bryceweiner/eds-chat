'use strict';

var assign        = require('object-assign');
var EventEmitter  = require('events').EventEmitter;

var Action        = require('../constants/Action');
var Dispatcher    = require('../dispatcher/Dispatcher');
var ChannelStore  = require('../stores/ChannelStore');
var Utils         = require('../utils/Message');

var CHANGE_EVENT = 'change';

var _messages = {};

function _addMessages(rawMessages) {
  rawMessages.forEach(_addMessage);
}

function _addMessage(rawMessage) {
  if (!_messages[rawMessage.mid]) {
    var message = Utils.convertRawMessage(rawMessage);
    message.isread = message.cid == ChannelStore.getCurrentId();
    _messages[message.id] = message;
  }
}

function _markAllInChannelRead(channelId) {
  for (var id in _messages) {
    if (_messages[id].channelId === channelId) {
      _messages[id].isRead = true;
    }
  }
}

var MessageStore = assign({}, EventEmitter.prototype, {

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
    return _messages[id];
  },

  getAll: function() {
    return _messages;
  },

  getAllForChannel: function(channelId) {
    var messages = [];
    for (var id in _messages) {
      if (_messages[id].channelId === channelId)
        messages.push(_messages[id]);
    }
    messages.sort(function(a, b) {
      return a.date - b.date;
    });
    return messages;
  },

  getAllForCurrentChannel: function() {
    return this.getAllForChannel(ChannelStore.getCurrentId());
  }

});

MessageStore.dispatchToken =
  Dispatcher.register(function(action) {

  switch(action.type) {

    case Action.CLICK_CHANNEL:
      Dispatcher.waitFor([ChannelStore.dispatchToken]);
      _markAllInChannelRead(ChannelStore.getCurrentId());
      MessageStore.emitChange();
      break;

    case Action.RECEIVE_CHANNEL_INFO:
      _addMessages(action.channelInfo.history);
      Dispatcher.waitFor([ChannelStore.dispatchToken]);
      _markAllInChannelRead(ChannelStore.getCurrentId());
      MessageStore.emitChange();
      break;

    case Action.RECEIVE_MESSAGES:
      _addMessages(action.rawMessages);
      Dispatcher.waitFor([ChannelStore.dispatchToken]);
      _markAllInChannelRead(ChannelStore.getCurrentId());
      MessageStore.emitChange();
      break;

    case Action.RECEIVE_MESSAGE:
      _addMessage(action.rawMessage);
      Dispatcher.waitFor([ChannelStore.dispatchToken]);
      _markAllInChannelRead(ChannelStore.getCurrentId());
      MessageStore.emitChange();
      break;
  }

});

module.exports = MessageStore;
