'use strict';

var keyMirror = require('keymirror');

module.exports =
  keyMirror(
    {
      // Client actions
      CLICK_CHANNEL: null,
      CREATE_MESSAGE: null,
      JOIN_CHANNEL: null,
      LEAVE_CHANNEL: null,

      // Server actions
      RECEIVE_USERINFO: null,
      RECEIVE_CHANNEL_INFO: null,
      RECEIVE_MESSAGE: null,
      RECEIVE_MESSAGES: null,
      DISCONNECTED: null
    });
