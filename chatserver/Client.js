'use strict';

const debug     = require('debug')('chat:client');
const debugmsg  = require('debug')('chat:client:message');

import { EventEmitter } from 'events';

/*
 * Represents a connection from an authenticated user.
 */
export default class Client extends EventEmitter {
  constructor(user, socket) {
    super();

    this.user   = user;
    this.socket = socket;

    this.user.clients.add(this);

    this.socket.on('error',      this.onError.bind(this));
    this.socket.on('disconnect', this.onDisconnect.bind(this));
    this.socket.on('message',    this.onMessage.bind(this));
  }

  onError(err) {
    console.error('onError: ', err.stack);
  }

  onDisconnect(data) {
    debug('Client disconnected: %s', data);
    this.emit('disconnect', this);
    this.removeAllListeners();
  }

  onMessage(message) {
    // TODO: check message
    debugmsg('Received: %s', JSON.stringify(message));
    this.emit('message', this, message);
  }
}
