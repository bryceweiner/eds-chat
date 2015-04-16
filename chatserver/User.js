'use strict';

module.exports = User;
function User(userid, username) {
  this.id       = userid;
  this.name     = username;
  this.clients  = new Set();
}
