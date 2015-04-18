'use strict';

var Action     = require('../constants/Action');
var Dispatcher = require('../dispatcher/Dispatcher');

module.exports = {

  clickChannel: function(channelId) {
    Dispatcher.dispatch({
      type: Action.CLICK_CHANNEL,
      channelId: channelId
    });
  },

  createMessage: function(text, currentChannelId) {
    Dispatcher.dispatch({
      type: Action.CREATE_MESSAGE,
      text: text,
      currentChannelId: currentChannelId
    });
  },

  joinChannel: function(appName, channelName) {
    Dispatcher.dispatch({
      type: Action.JOIN_CHANNEL,
      appName: appName,
      channelName: channelName
    });
  },

  leaveChannel: function(cid) {
    Dispatcher.dispatch({
      type: Action.LEAVE_CHANNEL,
      channelId: cid
    });
  }

};
