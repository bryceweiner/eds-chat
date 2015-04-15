'use strict';

export default class User {
  constructor(userid, username) {
    this.id       = userid;
    this.name     = username;
    this.clients  = new Set();
  }
}
