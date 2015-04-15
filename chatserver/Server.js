'use strict';

const assert  = require('better-assert');
const debug   = require('debug')('chat:server');
const co      = require('co');
const sio     = require('socket.io');
const request = require('co-request');

import { EventEmitter } from 'events';

import config from '../config';
import * as lib from './lib';

import Client from './Client';
import User   from './User';

let mid = 10;

export default class Server extends EventEmitter {

  constructor(httpServer) {
    super();

    this.socket = sio(httpServer);
    this.socket.on('connection', this.onConnection.bind(this));
    this.channels = {};
    this.users    = {};
    this.clients  = new Set();
  }

  onConnection(socket) {
    debug('Incoming connection');

    // Give the client 30s to authenticate.
    let timeoutTimer = setTimeout(function() {
      socket.emit('err', '[auth] authentication timed out after 30s');
      socket.close();
    }, 30000);

    // Auth handler
    socket.once('auth', (tokenHash, k) => {
      clearTimeout(timeoutTimer);
      co(this.onAuth.call(this, socket, tokenHash))
        .nodeify(k);
    });

    this.emit('new connection', socket);
  }

  *onAuth(socket, tokenHash) {
    debug('Auth attempt', tokenHash);

    // Test if it's a well-formed access token.
    let notValid = lib.isInvalidTokenHash(tokenHash);
    if (notValid) throw notValid;

    // Fetch userinfo from vault.
    let userInfo;
    try {
      let userInfoUrl =
        config.chatapp.API_URL + '/hashed-token-users/' +
        tokenHash + '?app_secret=' +
        config.chatapp.APP_SECRET;
      let result = yield request(userInfoUrl);

      if (result.statusCode !== 200)
        throw 'ERROR_FETCHING_USERINFO';

      userInfo = JSON.parse(result.body);

      assert(userInfo.hasOwnProperty('id'));
      assert(userInfo.hasOwnProperty('uname'));
      assert(typeof userInfo.id === 'number');
      assert(typeof userInfo.uname === 'string');
    } catch(ex) {
      if (ex instanceof Error)
        console.error(ex.stack);
      else
        console.error(ex);

      // Send some generic error report to the user.
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
    this.emit('new client', client, freshUser);

    // Finally send the username back to the client.
    return {username: username};
  }

  onDisconnect(client) {
    debug('Client disconnected:', client.user);
    this.clients.delete(client);
  }

  onMessage(client, message) {
    debug('Client message:', message);

    message.user = client.user.name;
    message.mid  = mid++;
    message.time = Date.now();

    this.socket.to('joined').emit('message', message);
  }

}
