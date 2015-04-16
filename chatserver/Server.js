'use strict';

const assert   = require('better-assert');
const debug    = require('debug')('chat:server');
const co       = require('co');
const sio      = require('socket.io');
const request  = require('co-request');

const config       = require('../config');

const Lib          = require('./Lib');
const Client       = require('./Client');
const User         = require('./User');

let mid = 10;

module.exports = Server;
function Server(httpServer) {
  this.socket = sio(httpServer);
  this.socket.on('connection', this.onConnection.bind(this));
  this.channels = {};
  this.users    = {};
  this.clients  = new Set();
}

Server.prototype.onConnection = function(socket) {
  debug('Incoming connection');

  const timeout = 30000; // we give the client 30s to authenticate
  let timeoutTimer = setTimeout(function() {
    socket.emit('err', '[auth] authentication timed out after ' + timeout + 'ms');
    socket.disconnect();
  }, timeout);

  // Auth handler
  var self = this;
  socket.once('auth', function(tokenHash, k) {
    clearTimeout(timeoutTimer);
    co(self.onAuth.call(self, socket, tokenHash))
      .then(function(info) {
        debug('[auth] Auth result %s', JSON.stringify(info));
        return k(null, info);
      })
      .catch(function(err) {
        debug('[auth] Auth err %s', err);
        return k(err);
      });
  });
};

Server.prototype.onAuth = function *(socket, tokenHash) {
  // Test if it's a well-formed access token.
  let notValid = Lib.isInvalidTokenHash(tokenHash);
  if (notValid) throw notValid;

  debug('Auth attempt %s', tokenHash);

  // Fetch userinfo from vault.
  let result;
  try {
    let userInfoUrl =
      config.chatapp.API_URL + '/hashed-token-users/' +
      tokenHash + '?app_secret=' +
      config.chatapp.APP_SECRET;
    result = yield request(userInfoUrl);
  } catch(ex) {
    console.error(ex);
    throw 'ERROR_AUTHENTICATING_USER';
  }

  if (result.statusCode !== 200)
    throw 'ERROR_FETCHING_USERINFO';

  let userInfo;
  try {
    userInfo = JSON.parse(result.body);

    assert(userInfo.hasOwnProperty('id'));
    assert(userInfo.hasOwnProperty('uname'));
    assert(typeof userInfo.id === 'number');
    assert(typeof userInfo.uname === 'string');
  } catch(ex) {
    console.error(ex);
    throw 'ERROR_AUTHENTICATING_USER';
  }

  let userid   = userInfo.id;
  let username = userInfo.uname;

  let user      = this.users[userid];
  let freshUser = !user;
  if (freshUser) {
    user = new User(userid, username);
    this.users[userid] = user;
  }

  // TODO: Support leavinig/joining channels. Get rid
  // of socket.io rooms?
  socket.join('joined');

  let client = new Client(user, socket);
  client.on('disconnect', this.onDisconnect.bind(this));
  client.on('message', this.onMessage.bind(this));
  this.clients.add(client);

  // Finally send the username back to the client.
  return {username: username};
};

Server.prototype.onDisconnect = function(client) {
  debug('Client disconnected:', client.user);
  this.clients.delete(client);
};

Server.prototype.onMessage = function(client, message) {
  message.user = client.user.name;
  message.mid  = mid++;
  message.time = Date.now();

  this.socket.to('joined').emit('message', message);
};
