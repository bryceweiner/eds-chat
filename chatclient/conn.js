'use strict';

var ServerAction = require('./actions/ServerAction');
var Action       = require('./constants/Action');
var Vault        = require('./constants/Vault');
var Dispatcher   = require('./dispatcher/Dispatcher');

function connect(hashedAccessToken) {
  console.log('[conn] Connecting to', Vault.CHAT_HOST);
  var socket = io(Vault.CHAT_HOST);

  socket.on('connect', function(data) {
    var authInfo =
      { hashed_access_token: hashedAccessToken };

    console.log('[conn] Connection established');
    console.log('[auth] Authenticating ' +
                JSON.stringify(authInfo));

    // TODO: get rid of the callback and get the user info
    // over a seperate event
    socket.emit('auth', authInfo, function(err, info) {
      if (err)
        return console.error('Error when joining the chat', err);

      console.log('[join] ' + JSON.stringify(info));
      ServerAction.receiveUserInfo(info);
    });
  });

  socket.on('message', function(message) {
    console.log('[message]', message);
    ServerAction.receiveMessage(message);
  });

  var dispatchToken = Dispatcher.register(function(action) {
    console.log('[action]', JSON.stringify(action));

    switch(action.type) {
    case Action.CREATE_MESSAGE:
      socket.emit(
        'message',
        { cid: action.currentChannelId,
          text: action.text
        });
      break;

    }
  });
}

module.exports = connect;
