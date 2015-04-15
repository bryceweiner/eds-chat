'use strict';

var React  = require('react');
var sha256 = require('./lib/sha256.js');

var ServerAction = require('./actions/ServerAction');
var ChatClient   = require('./components/ChatClient.react');
var UserStore    = require('./stores/UserStore');

var connect = require('./conn');

// export for http://fb.me/react-devtools
window.React = React;

// Initialize the connection and user store
(function initStore() {

  var fragmentParams = {};
  var e,
      // Regex for replacing addition symbol with a space
      a = /\+/g,
      r = /([^&;=]+)=?([^&;]*)/g,
      d = function (s) {
        return decodeURIComponent(s.replace(a, " "));
      },
      q = window.location.hash.substring(1);

  while (e = r.exec(q))
    fragmentParams[d(e[1])] = d(e[2]);

  //window.location.hash = '';
  console.log('[auth] fragmentParams:', fragmentParams);

  // The access_token will be undefined or a string.
  var accessToken = fragmentParams.access_token;
  var tokenHash =
    accessToken
      ? sha256(accessToken)
      : null;
  var user = { tokenHash: tokenHash };

  console.log('[auth] Access token:', accessToken);
  console.log('[auth] Token hash:', tokenHash);

  UserStore.init(user);
  connect(tokenHash);
})();



var messages =
  [ {
      mid: '0',
      cid: '#vault',
      user: 'Edwin',
      text: 'Wow vault',
      time: Date.now() - 30000
    },
    {
      mid: '1',
      cid: '#bustabit',
      user: 'Edwin',
      text: 'Bust3d!',
      time: Date.now() - 20000
    },
    {
      mid: '2',
      cid: '#dustdice',
      user: 'Edwin',
      text: 'very dusty',
      time: Date.now() - 10000
    }
  ];

ServerAction.receiveAll(messages);

React.render(
    <ChatClient />,
    document.getElementById('react')
);
