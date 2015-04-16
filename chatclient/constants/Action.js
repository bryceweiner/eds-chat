'use strict';

var keyMirror = require('keymirror');

module.exports =
  keyMirror(
    {
      // Client actions
      CLICK_CHANNEL: null,
      CREATE_MESSAGE: null,

      // Server actions
      RECEIVE_USERINFO: null,
      RECEIVE_CHANNEL_INFO: null,
      RECEIVE_MESSAGE: null,
      RECEIVE_MESSAGES: null,
      DISCONNECTED: null
    });
