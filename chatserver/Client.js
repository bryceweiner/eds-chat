'use strict';

const co           = require('co');
const debug        = require('debug')('chat:client');
const debugmsg     = require('debug')('chat:message');
const inherits     = require('util').inherits;
const EventEmitter = require('events').EventEmitter;
const Db           = require('./Database');

/*
 * Represents a connection from an authenticated user.
 */
module.exports = Client;
function Client(user, socket) {
  EventEmitter.call(this);

  this.user   = user;
  this.socket = socket;

  this.user.clients.add(this);

  this.socket.on('error',        this.onError.bind(this));
  this.socket.on('disconnect',   this.onDisconnect.bind(this));
  this.socket.on('message',      this.onMessage.bind(this));
  this.socket.on('join_channel', this.onJoinChannel.bind(this));
};

inherits(Client, EventEmitter);

Client.prototype.onError = function(err) {
  console.error('onError: ', err.stack);
};

Client.prototype.onDisconnect = function(data) {
  debug('Client disconnected: %s', data);
  this.emit('disconnect', this);
  this.removeAllListeners();
};

Client.prototype.onJoinChannel = function(info) {
  // TODO: check info
  debug('[join] %s: %s', this.user.name, JSON.stringify(info));

  let socket = this.socket;
  co(function *() {
    try {
      let channel = yield Db.getChannel(info.app, info.chan);
      let messages = yield Db.getMessages(channel.cid);
      channel.history = messages;
      socket.emit('channel_info', channel);
    } catch(ex) {
      console.error(ex.stack);
    }
  });
};

Client.prototype.onMessage = function(message) {
  // TODO: check message
  debugmsg('%s: %s', this.user.name, JSON.stringify(message));
  this.emit('message', this, message);
};
