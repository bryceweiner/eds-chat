'use strict';

var React = require('react');

var MessageSection = require('./MessageSection.react');
var ChannelSection = require('./ChannelSection.react');
var UserSection    = require('./UserSection.react');

var ChatClient = React.createClass({

  render: function() {
    return (
        <div className="chat">
          <div className="channel-user-section">
            <UserSection />
            <ChannelSection />
          </div>
        <MessageSection />
      </div>
    );
  }

});

module.exports = ChatClient;
