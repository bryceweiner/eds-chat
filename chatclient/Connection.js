'use strict';

var inherits     = require('inherits');
var EventEmitter = require('events').EventEmitter;

var ServerAction = require('./actions/ServerAction');
var Action       = require('./constants/Action');
var Vault        = require('./constants/Vault');
var Dispatcher   = require('./dispatcher/Dispatcher');

function Connection(tokenHash) {
  EventEmitter.call(this);
  console.log('[conn] Connecting to', Vault.CHAT_HOST);
  this.tokenHash = tokenHash;

  this.socket = io(Vault.CHAT_HOST);
  this.socket.on('connect', this.onConnect.bind(this));
  this.socket.on('disconnect', this.onDisconnect.bind(this));
  this.socket.on('channel_info', this.onChannelInfo.bind(this));
  this.socket.on('message', this.onMessage.bind(this));

  var self = this;
  this.dispatchToken = Dispatcher.register(function(action) {
    console.log('[action]', JSON.stringify(action));

    switch(action.type) {
    case Action.CREATE_MESSAGE:
      self.sendMessage(action.currentChannelId, action.text);
      break;

    case Action.LEAVE_CHANNEL:
      self.leaveChannel(action.channelId);
      break;

    }
  });
}

inherits(Connection, EventEmitter);

Connection.prototype.onConnect = function(data) {

  console.log('[conn] Connection established');
  console.log('[auth] Authenticating ' +
              this.tokenHash);

  // TODO: get rid of the callback and get the user info
  // over a seperate event
  var self = this;
  this.socket.emit('auth', this.tokenHash, function(err, info) {
    if (err)
      return console.error('Error during authentication', err.stack);

    console.log('[auth] ' + JSON.stringify(info));
    ServerAction.receiveUserInfo(info);
    self.emit('connect', data);
  });
};

Connection.prototype.onDisconnect = function() {
  console.log('[conn] disconnected');
  ServerAction.disconnected();
  this.emit('disconnet');
};

Connection.prototype.onMessage = function(message) {
  console.log('[message]', message);
  ServerAction.receiveMessage(message);
  this.emit('message', message);
};

Connection.prototype.onChannelInfo = function(channelInfo) {
  console.log('[chan]', channelInfo);
  ServerAction.receiveChannelInfo(channelInfo);
  this.emit('channel_info', channelInfo);
};

Connection.prototype.sendMessage = function(cid, text) {
  return this.socket.emit('message', {cid: cid, text: text});
};

Connection.prototype.joinChannel = function(appId, chanName) {
  console.log('[join] Joining channel', appId + '#' + chanName);
  return this.socket.emit(
    'join_channel', {aid: appId, chan: chanName},
    function(err, info) {
      if (err) return console.error(err);
      ServerAction.receiveChannelInfo(info);
    });
};

Connection.prototype.leaveChannel = function(channelId) {
  console.log('[leave] Leaving channel', channelId);
  return this.socket.emit('leave_channel', {channel_id: channelId});
};

module.exports = Connection;
