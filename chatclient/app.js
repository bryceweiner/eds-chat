'use strict';

var React  = require('react');
var sha256 = require('./lib/sha256.js');

var ServerAction = require('./actions/ServerAction');
var ChatClient   = require('./components/ChatClient.react');
var UserStore    = require('./stores/UserStore');

var Connection   = require('./Connection');

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
  var conn = new Connection(tokenHash);
  conn.on('connect', function() {
    conn.joinChannel(1, 'general');
  });
})();

React.render(
    <ChatClient />,
    document.getElementById('react')
);
