'use strict';

var inherits     = require('inherits');

var ServerAction = require('./actions/ServerAction');
var Action       = require('./constants/Action');
var Vault        = require('./constants/Vault');
var Dispatcher   = require('./dispatcher/Dispatcher');

function Connection(tokenHash) {
  console.log('[conn] Connecting to', Vault.CHAT_HOST);
  this.tokenHash = tokenHash;

  this.socket = io(Vault.CHAT_HOST);
  this.socket.on('connect', this.onConnect.bind(this));
  this.socket.on('disconnect', this.onDisconnect.bind(this));
  this.socket.on('message', this.onMessage.bind(this));

  var self = this;
  this.dispatchToken = Dispatcher.register(function(action) {
    console.log('[action]', JSON.stringify(action));

    switch(action.type) {
    case Action.CREATE_MESSAGE:
      self.sendMessage(action.currentChannelId, action.text);
      break;

    }
  });
}

inherits(Connection, Object);

Connection.prototype.onConnect = function(data) {

  console.log('[conn] Connection established');
  console.log('[auth] Authenticating ' +
              this.tokenHash);

  // TODO: get rid of the callback and get the user info
  // over a seperate event
  this.socket.emit('auth', this.tokenHash, function(err, info) {
    if (err)
      return console.error('Error when joining the chat', err);

    console.log('[join] ' + JSON.stringify(info));
    ServerAction.receiveUserInfo(info);
  });
};

Connection.prototype.onDisconnect = function() {
  console.log('[conn] disconnected');
  ServerAction.disconnected();
};

Connection.prototype.onMessage = function(message) {
  console.log('[message]', message);
  ServerAction.receiveMessage(message);
};

Connection.prototype.sendMessage = function(cid, text) {
  return this.socket.emit('message', {cid: cid, text: text});
};

module.exports = Connection;
