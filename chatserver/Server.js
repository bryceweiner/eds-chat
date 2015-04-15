'use strict';

const debug  = require('debug')('chat:server');
const co     = require('co');
const sio    = require('socket.io');

import { EventEmitter } from 'events';

import * as Lib from './lib';

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
    socket.once('auth', (authInfo, k) => {
      clearTimeout(timeoutTimer);
      co(this.onAuth.call(this, socket, authInfo))
        .nodeify(k);
    });

    this.emit('new connection', socket);
  }

  *onAuth(socket, authInfo) {
    debug('Auth attempt', authInfo);
    let accessToken = authInfo.access_token;

    if (!accessToken)
      throw 'INVALID_ACCESS_TOKEN';

    // TODO: Fetch userinfo from vault.
    let userid   = Math.floor(Math.random()*10000);
    let username = 'User' + userid;

    try {
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
      return {username: username};
    } catch(ex) {
      console.log(ex.stack);
    }
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
