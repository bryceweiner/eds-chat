'use strict';

module.exports = {

  convertRawMessage: function(rawMessage) {
    return {
      id: rawMessage.mid,
      channelId: rawMessage.cid,
      username: rawMessage.user,
      date: new Date(rawMessage.time),
      text: rawMessage.text,
      isRead: false
    };
  }

};
