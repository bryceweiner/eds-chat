'use strict';

const co           = require('co');
const debug        = require('debug')('chat:client');
const debugmsg     = require('debug')('chat:message');
const inherits     = require('util').inherits;
const EventEmitter = require('events').EventEmitter;
const clientSafe   = require('./ClientSafe');
const Db           = require('./Database');

const ClientSafeError = clientSafe.ClientSafeError;

/*
 * Represents a connection from an authenticated user.
 */
module.exports = Client;
function Client(user, socket, server) {
  EventEmitter.call(this);

  this.user   = user;
  this.socket = socket;
  // Allows client to access server state like conn count
  this.server = server;

  this.user.clients.add(this);

  /* A generic exception handler
   *
   * Exceptions are pushed through the callback if one is given and
   * otherwise an `err` event is sent to the client. This handler
   * currently only works for generator functions that accept exactly
   * one argument.
   */
  function genericHandler(gen) {
    return function(data, k) {
      if (typeof k !== 'function') {
        k = function(err, data) {
          if (err) socket.emit('err', err);
        };
      }

      co(
        gen(data)
      ).then(function(ret) {
          k(null, ret);
      }).catch(function(ex) {
        if (ex instanceof ClientSafeError)
          return k({code: ex.code, message: ex.message});

        // Something else went wrong. Log the name of the event
        // generator and the data provided.
        console.error('[INTERNAL_ERROR]', gen.name, data);
        if (ex instanceof Error) {
          console.error(ex.stack);
        } else {
          console.error(ex);
        }

        let genericError =
          { code: 'INTERNAL_ERROR',
            message: 'Something went wrong. and we are investigating.'
          };

        return k(genericError);
      });
    };
  }

  this.socket.on('error',         this.onError.bind(this));
  this.socket.on('disconnect',    this.onDisconnect.bind(this));

  this.socket.on('join_channel',  genericHandler(this.onJoinChannel.bind(this)));
  this.socket.on('leave_channel', genericHandler(this.onLeaveChannel.bind(this)));
  this.socket.on('message',       genericHandler(this.onMessage.bind(this)));
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

Client.prototype.onJoinChannel = function*(join) {
  debug('[join] %s: %s', this.user.name, JSON.stringify(join));

  const errMsg =
    'To join a channel you need to provide an join info object and'
    + ' a callback. The join info object should carry the'
    + ' the application id in the `aid` field and the channel name'
    + ' in the `chan` field.';

  clientSafe.assert(typeof join === 'object' && join !== null,
                    'JOIN_OBJECT', errMsg);
  clientSafe.assert(join.hasOwnProperty('aid'),
                    'JOIN_AID_MISSING', errMsg);
  clientSafe.assert(join.hasOwnProperty('chan'),
                    'JOIN_CHAN_MISSING', errMsg);
  clientSafe.assert(Number.isSafeInteger(join.aid) && join.aid >= 0,
                    'JOIN_APP_ID_INVALID', errMsg);
  clientSafe.assert(typeof join.chan === 'string',
                    'JOIN_CHANNEL_NAME_INVALID', errMsg);

  let channel = yield Db.getChannel(join.aid, join.chan);
  channel.history = yield Db.getHistory(channel.cid);
  channel.num_users = Object.keys(this.server.users).length;

  // FIXME: Not sure where to put this, but hacking it in right here.
  // Client#app_id :: Maybe Int
  this.app_id = join.aid;
  var channelName = 'app:' + join.aid;
  debug('[join] joined channel: %s', channelName);
  this.socket.join(channelName);

  // TODO: Subscribe client.

  return channel;
};

Client.prototype.onLeaveChannel = function*(leave) {
  debug('[leave] %s: %s', this.user.name, JSON.stringify(leave));

  const errMsg =
    'To leave a channel you need to provide object with'
    + ' the channel id in the `cid` field of a channel that you'
    + ' previously joined.';

  clientSafe.assert(typeof leave === 'object' && leave !== null,
                    'LEAVE_OBJECT', errMsg);
  clientSafe.assert(leave.hasOwnProperty('cid'),
                    'LEAVE_CID_MISSING', errMsg);
  clientSafe.assert(Number.isSafeInteger(leave.cid) && leave.cid >= 0,
                    'LEAVE_CID_INVALID', errMsg);

  // TODO: Implement this
};

Client.prototype.onMessage = function*(message) {
  debugmsg('%s: %s', this.user.name, JSON.stringify(message));

  const errMsg =
    'To leave a channel you need to provide object with'
    + ' the channel id in the `cid` field of a channel that you'
    + ' previously joined.';

  clientSafe.assert(typeof message === 'object' && message !== null,
                    'MESSAGE_OBJECT', errMsg);
  clientSafe.assert(message.hasOwnProperty('cid'),
                    'MESSAGE_CID_MISSING', errMsg);
  clientSafe.assert(Number.isSafeInteger(message.cid) && message.cid >= 0,
                    'MESSAGE_CID_INVALID', errMsg);

  this.emit('message', this, message);
};

Client.prototype.sendError = function(err) {
  this.socket.emit('err', err);
};
