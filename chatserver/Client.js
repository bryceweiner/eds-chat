'use strict';

const co        = require('co');
const debug     = require('debug')('chat:client');
const debugmsg  = require('debug')('chat:client:message');

import { EventEmitter } from 'events';
import * as Db from './Database';

/*
 * Represents a connection from an authenticated user.
 */
export default class Client extends EventEmitter {
  constructor(user, socket) {
    super();

    this.user   = user;
    this.socket = socket;

    this.user.clients.add(this);

    this.socket.on('error',        this.onError.bind(this));
    this.socket.on('disconnect',   this.onDisconnect.bind(this));
    this.socket.on('message',      this.onMessage.bind(this));
    this.socket.on('join_channel', this.onJoinChannel.bind(this));
  }

  onError(err) {
    console.error('onError: ', err.stack);
  }

  onDisconnect(data) {
    debug('Client disconnected: %s', data);
    this.emit('disconnect', this);
    this.removeAllListeners();
  }

  onJoinChannel(info) {
    // TODO: check info
    debug('Received: %s', JSON.stringify(info));

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
  }

  onMessage(message) {
    // TODO: check message
    debugmsg('Received: %s', JSON.stringify(message));
    this.emit('message', this, message);
  }
}
