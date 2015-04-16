'use strict';

var Action     = require('../constants/Action');
var Dispatcher = require('../dispatcher/Dispatcher');

module.exports = {

  receiveUserInfo: function(rawUserInfo) {
    Dispatcher.dispatch({
      type: Action.RECEIVE_USERINFO,
      username: rawUserInfo.username
    });
  },

  receiveAll: function(rawMessages) {
    Dispatcher.dispatch({
      type: Action.RECEIVE_MESSAGES,
      rawMessages: rawMessages
    });
  },

  receiveMessage: function(rawMessage) {
    Dispatcher.dispatch({
      type: Action.RECEIVE_MESSAGE,
      rawMessage: rawMessage
    });
  },

  receiveChannelInfo: function(chanInfo) {
    Dispatcher.dispatch({
      type: Action.RECEIVE_CHANNEL_INFO,
      channelInfo: chanInfo
    });
  },

  disconnected: function() {
    Dispatcher.dispatch({
      type: Action.DISCONNECTED
    });
  }

};
