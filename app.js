'use strict';

// Shamefully ripped out of https://github.com/then/nodeify
if (typeof Promise.prototype.nodeify !== 'function') {
  Promise.prototype.nodeify = function(cb) {
    if (typeof cb !== 'function') return this;
    return  this
      .then(function (res) {
        process.nextTick(function () {
          cb(null, res); });
      }, function (err) {
        process.nextTick(function () {
          cb(err); });
      });
  };
}

// Load all remaining files through babel
var ChatServer = require('./chatserver/Server.js');
var server     = require('./server/index.js');
var chatServer = new ChatServer(server.httpServer);
